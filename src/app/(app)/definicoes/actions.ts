"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { ok: boolean; message: string } | null;

export async function savePerfil(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dados = {
    nome: String(formData.get("nome") ?? "").trim() || null,
    nif: String(formData.get("nif") ?? "").trim() || null,
    morada: String(formData.get("morada") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
  };

  if (dados.nif && !/^\d{9}$/.test(dados.nif)) {
    return { ok: false, message: "O NIF deve ter exatamente 9 dígitos." };
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
  return { ok: true, message: "Dados guardados com sucesso." };
}
