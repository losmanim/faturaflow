"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEmissor } from "@/lib/fiscal";
import type { DadosEmissao } from "@/lib/fiscal";
import type { EstadoFatura, StatusNota, Fatura, FaturaLinha, Cliente, Perfil } from "@/lib/types";

export type FormState = { error: string } | null;
export type NotaState = { ok: boolean; mensagem: string } | null;

/** Transições de estado permitidas (máquina de estados da fatura). */
const TRANSICOES: Record<EstadoFatura, EstadoFatura[]> = {
  rascunho: ["emitida", "anulada"],
  emitida: ["paga", "anulada"],
  paga: [],
  anulada: [],
};

export async function createFatura(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clienteId = String(formData.get("cliente_id") ?? "");
  const notas = String(formData.get("notas") ?? "").trim() || null;
  // "competencia" vem no formato "YYYY-MM" (input type=month); a coluna é date
  const competenciaRaw = String(formData.get("competencia") ?? "").trim();
  const competencia = competenciaRaw ? `${competenciaRaw}-01` : null;
  if (!clienteId) return { error: "Escolhe um cliente." };

  const descricoes = formData.getAll("descricao").map((v) => String(v).trim());
  const quantidades = formData.getAll("quantidade").map(Number);
  const precos = formData.getAll("preco").map(Number);
  const issList = formData.getAll("iss").map(Number);
  const nbsList = formData
    .getAll("nbs")
    .map((v) => String(v).trim() || null);

  const linhas = descricoes
    .map((descricao, i) => {
      const nbs = nbsList[i];
      const iss = isNaN(issList[i]) ? 0 : issList[i];
      return {
        descricao,
        quantidade: quantidades[i],
        preco_unitario: precos[i],
        iss,
        nbs,
      };
    })
    .filter(
      (l) =>
        l.descricao &&
        !isNaN(l.quantidade) &&
        l.quantidade > 0 &&
        !isNaN(l.preco_unitario) &&
        l.preco_unitario >= 0 &&
        l.iss >= 0 &&
        l.iss <= 100
    );

  if (linhas.length === 0) {
    return { error: "Adiciona pelo menos uma linha válida." };
  }

  // Numeração sequencial por ano: NS 2026/0001, NS 2026/0002, ...
  const ano = new Date().getFullYear();
  const { count } = await supabase
    .from("faturas")
    .select("*", { count: "exact", head: true })
    .gte("data_emissao", `${ano}-01-01`);
  const numero = `NS ${ano}/${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data: fatura, error } = await supabase
    .from("faturas")
    .insert({
      user_id: user.id,
      cliente_id: clienteId,
      numero,
      notas,
      competencia,
      status_nota: "nao_emitida",
      estado: "rascunho",
    })
    .select("id")
    .single();

  if (error || !fatura) return { error: "Erro ao criar a nota." };

  const { error: erroLinhas } = await supabase
    .from("fatura_linhas")
    .insert(linhas.map((l) => ({ ...l, fatura_id: fatura.id })));

  if (erroLinhas) {
    // Compensação: sem transações via PostgREST, remove a nota órfã
    await supabase.from("faturas").delete().eq("id", fatura.id);
    return { error: "Erro ao guardar as linhas da nota." };
  }

  revalidatePath("/faturas");
  revalidatePath("/dashboard");
  redirect(`/faturas/${fatura.id}`);
}

/** Só é possível emitir/cancelar uma nota nestes estados. */
const NOTA_EMITIVEL: StatusNota[] = ["nao_emitida", "rejeitada"];

export async function emitirNota(
  id: string,
  _prev: NotaState
): Promise<NotaState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: fatura } = await supabase
    .from("faturas")
    .select("*, clientes(*), fatura_linhas(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!fatura) return { ok: false, mensagem: "Nota não encontrada." };

  const f = fatura as unknown as Fatura & {
    clientes: Cliente;
    fatura_linhas: FaturaLinha[];
  };

  if (!NOTA_EMITIVEL.includes(f.status_nota)) {
    return { ok: false, mensagem: `Não é possível emitir no estado "${f.status_nota}".` };
  }
  if (!f.clientes?.cpf_cnpj) {
    return {
      ok: false,
      mensagem: "O tomador precisa de CPF ou CNPJ. Edita o cliente antes de emitir.",
    };
  }

  const { data: perfilData, error: erroPerfil } = await supabase
    .from("perfil")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const perfil = perfilData as Perfil | null;

  const errosPerfil: string[] = [];
  if (!perfil?.cnpj) errosPerfil.push("CNPJ da empresa emissora (Definições).");
  if (!perfil?.razao_social) errosPerfil.push("Razão social (Definições).");
  if (!perfil?.codigo_municipio) errosPerfil.push("Código do município (Definições).");
  if (errosPerfil.length > 0) {
    return {
      ok: false,
      mensagem: `Completa os dados fiscais em Definições: ${errosPerfil.join(" ")}`,
    };
  }
  if (!perfil) {
    return { ok: false, mensagem: "Completa os dados fiscais em Definições." };
  }

  // RPS: numeração sequencial do ano (por emissor do utilizador)
  const ano = new Date().getFullYear();
  const rpsAno = `${ano}-01-01`;
  const { count: countRps } = await supabase
    .from("faturas")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("data_emissao", rpsAno)
    .not("rps_numero", "is", null);
  const rpsNumero = (countRps ?? 0) + 1;
  const rpsSerie = "NFS";

  // Reserva o RPS e marca como processando antes de chamar o emissor
  await supabase
    .from("faturas")
    .update({ status_nota: "processando", rps_numero: rpsNumero, rps_serie: rpsSerie })
    .eq("id", id);

  const valorTotal = f.fatura_linhas.reduce(
    (s, l) => s + l.quantidade * l.preco_unitario,
    0
  );

  const dados: DadosEmissao = {
    empresa: {
      razaoSocial: perfil.razao_social!,
      cnpj: perfil.cnpj!,
      inscricaoMunicipal: perfil.inscricao_municipal ?? null,
      regime: perfil.regime_tributario,
      municipio: perfil.municipio ?? null,
      codigoMunicipio: perfil.codigo_municipio!,
      aliqIss: Number(perfil.aliq_iss ?? 0),
      nbsDefault: perfil.nbs_default ?? null,
    },
    tomador: {
      nome: f.clientes.nome,
      cpfCnpj: f.clientes.cpf_cnpj,
      email: f.clientes.email,
    },
    rps: {
      numero: rpsNumero,
      serie: rpsSerie,
      competencia: f.competencia || new Date().toISOString().slice(0, 10),
    },
    servicos: f.fatura_linhas.map((l) => ({
      descricao: l.descricao,
      quantidade: l.quantidade,
      valor: l.preco_unitario * l.quantidade,
      nbs: l.nbs,
      iss: Number(l.iss ?? 0),
      simplesNacional: perfil.regime_tributario !== "Lucro Presumido" && perfil.regime_tributario !== "Lucro Real",
    })),
    valorTotal,
  };

  const resultado = await getEmissor().emitir(dados);

  if (resultado.autorizada) {
    await supabase
      .from("faturas")
      .update({
        status_nota: "autorizada",
        numero_nfse: resultado.numeroNfse,
        codigo_verificacao: resultado.codigoVerificacao,
        protocolo: resultado.protocolo,
        link_pdf: resultado.linkPdf,
        xml_nota: resultado.xml,
        motivo_rejeicao: null,
        data_autorizacao: new Date().toISOString(),
        estado: "emitida",
      })
      .eq("id", id);
  } else {
    await supabase
      .from("faturas")
      .update({ status_nota: "rejeitada", motivo_rejeicao: resultado.motivo })
      .eq("id", id);
  }

  revalidatePath(`/faturas/${id}`);
  revalidatePath("/faturas");
  revalidatePath("/dashboard");

  return resultado.autorizada
    ? { ok: true, mensagem: `NFS-e ${resultado.numeroNfse} autorizada.` }
    : { ok: false, mensagem: resultado.motivo ?? "Nota rejeitada." };
}

export async function cancelarNota(
  id: string,
  _prev: NotaState
): Promise<NotaState> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faturas")
    .select("status_nota")
    .eq("id", id)
    .single();

  if (data?.status_nota !== "autorizada") {
    return { ok: false, mensagem: "Só é possível cancelar notas autorizadas." };
  }

  await supabase
    .from("faturas")
    .update({ status_nota: "cancelada", estado: "anulada" })
    .eq("id", id);

  revalidatePath(`/faturas/${id}`);
  revalidatePath("/faturas");
  revalidatePath("/dashboard");
  return { ok: true, mensagem: "NFS-e cancelada." };
}

export async function updateEstadoFatura(id: string, estado: EstadoFatura) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faturas")
    .select("estado")
    .eq("id", id)
    .single();

  if (
    data &&
    TRANSICOES[data.estado as EstadoFatura]?.includes(estado)
  ) {
    await supabase.from("faturas").update({ estado }).eq("id", id);
  }

  revalidatePath("/faturas");
  revalidatePath(`/faturas/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteFatura(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faturas")
    .select("estado")
    .eq("id", id)
    .single();

  // Só se podem eliminar rascunhos — notas emitidas ficam registadas
  if (data?.estado === "rascunho") {
    await supabase.from("faturas").delete().eq("id", id);
  }

  revalidatePath("/faturas");
  revalidatePath("/dashboard");
  redirect("/faturas");
}
