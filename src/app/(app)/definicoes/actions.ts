"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { RegimeTributario } from "@/lib/types";

export type SettingsState = { ok: boolean; message: string } | null;

const REGIMES: RegimeTributario[] = [
  "MEI",
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
];

export async function savePerfil(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const regimeRaw = String(formData.get("regime_tributario") ?? "");
  const regime = (REGIMES.includes(regimeRaw as RegimeTributario)
    ? regimeRaw
    : "MEI") as RegimeTributario;

  const dados = {
    nome: String(formData.get("nome") ?? "").trim() || null,
    razao_social: String(formData.get("razao_social") ?? "").trim() || null,
    cnpj: String(formData.get("cnpj") ?? "").replace(/\D/g, "") || null,
    inscricao_municipal:
      String(formData.get("inscricao_municipal") ?? "").trim() || null,
    regime_tributario: regime,
    municipio: String(formData.get("municipio") ?? "").trim() || null,
    codigo_municipio:
      String(formData.get("codigo_municipio") ?? "").replace(/\D/g, "") || null,
    aliq_iss: Number(formData.get("aliq_iss") ?? 0),
    nbs_default: String(formData.get("nbs_default") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
    morada: String(formData.get("morada") ?? "").trim() || null,
  };

  if (dados.cnpj && !/^\d{14}$/.test(dados.cnpj)) {
    return { ok: false, message: "O CNPJ deve ter exatamente 14 dígitos." };
  }
  if (dados.codigo_municipio && !/^\d{7}$/.test(dados.codigo_municipio)) {
    return { ok: false, message: "O código do município (IBGE) tem 7 dígitos." };
  }
  if (isNaN(dados.aliq_iss) || dados.aliq_iss < 0 || dados.aliq_iss > 100) {
    return { ok: false, message: "Alíquota de ISS inválida (0 a 100)." };
  }
  if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    return { ok: false, message: "Email inválido." };
  }

  const { error } = await supabase.from("perfil").upsert({
    user_id: user.id,
    ...dados,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, message: "Erro ao guardar. Tenta novamente." };
  }

  revalidatePath("/definicoes");
  revalidatePath("/faturas");
  return { ok: true, message: "Dados da empresa guardados." };
}
