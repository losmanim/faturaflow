"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EstadoFatura } from "@/lib/types";

export type FormState = { error: string } | null;

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
  if (!clienteId) return { error: "Escolhe um cliente." };

  const descricoes = formData.getAll("descricao").map((v) => String(v).trim());
  const quantidades = formData.getAll("quantidade").map(Number);
  const precos = formData.getAll("preco").map(Number);
  const ivas = formData.getAll("iva").map(Number);
  const produtoIds = formData
    .getAll("produto_id")
    .map((v) => String(v) || null);

  const linhas = descricoes
    .map((descricao, i) => ({
      descricao,
      quantidade: quantidades[i],
      preco_unitario: precos[i],
      iva: ivas[i],
      produto_id: produtoIds[i],
    }))
    .filter(
      (l) =>
        l.descricao &&
        !isNaN(l.quantidade) &&
        l.quantidade > 0 &&
        !isNaN(l.preco_unitario) &&
        l.preco_unitario >= 0 &&
        !isNaN(l.iva) &&
        l.iva >= 0 &&
        l.iva <= 100
    );

  if (linhas.length === 0) {
    return { error: "Adiciona pelo menos uma linha válida." };
  }

  // Numeração sequencial por ano: FT 2026/0001, FT 2026/0002, ...
  const ano = new Date().getFullYear();
  const { count } = await supabase
    .from("faturas")
    .select("*", { count: "exact", head: true })
    .gte("data_emissao", `${ano}-01-01`);
  const numero = `FT ${ano}/${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { data: fatura, error } = await supabase
    .from("faturas")
    .insert({
      user_id: user.id,
      cliente_id: clienteId,
      numero,
      notas,
      estado: "rascunho",
    })
    .select("id")
    .single();

  if (error || !fatura) return { error: "Erro ao criar a fatura." };

  const { error: erroLinhas } = await supabase
    .from("fatura_linhas")
    .insert(linhas.map((l) => ({ ...l, fatura_id: fatura.id })));

  if (erroLinhas) {
    // Compensação: sem transações via PostgREST, remove a fatura órfã
    await supabase.from("faturas").delete().eq("id", fatura.id);
    return { error: "Erro ao guardar as linhas da fatura." };
  }

  revalidatePath("/faturas");
  revalidatePath("/dashboard");
  redirect(`/faturas/${fatura.id}`);
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

  // Só se podem eliminar rascunhos — faturas emitidas ficam registadas
  if (data?.estado === "rascunho") {
    await supabase.from("faturas").delete().eq("id", id);
  }

  revalidatePath("/faturas");
  revalidatePath("/dashboard");
  redirect("/faturas");
}
