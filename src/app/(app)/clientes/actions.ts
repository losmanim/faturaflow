"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string } | null;

function lerForm(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    nif: String(formData.get("nif") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    telefone: String(formData.get("telefone") ?? "").trim() || null,
    morada: String(formData.get("morada") ?? "").trim() || null,
  };
}

function validar(dados: ReturnType<typeof lerForm>): string | null {
  if (!dados.nome) return "O nome é obrigatório.";
  if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    return "Email inválido.";
  }
  if (dados.nif && !/^\d{9}$/.test(dados.nif)) {
    return "O NIF deve ter exatamente 9 dígitos.";
  }
  return null;
}

export async function createCliente(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dados = lerForm(formData);
  const erro = validar(dados);
  if (erro) return { error: erro };

  const { error } = await supabase
    .from("clientes")
    .insert({ ...dados, user_id: user.id });

  if (error) return { error: "Erro ao guardar o cliente. Tenta novamente." };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const dados = lerForm(formData);
  const erro = validar(dados);
  if (erro) return { error: erro };

  const { error } = await supabase.from("clientes").update(dados).eq("id", id);

  if (error) return { error: "Erro ao atualizar o cliente." };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCliente(id: string) {
  const supabase = await createClient();
  await supabase.from("clientes").delete().eq("id", id);
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}
