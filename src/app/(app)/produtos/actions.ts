"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string } | null;

function lerForm(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    descricao: String(formData.get("descricao") ?? "").trim() || null,
    preco: Number(formData.get("preco") ?? NaN),
    iva: Number(formData.get("iva") ?? 23),
  };
}

function validar(dados: ReturnType<typeof lerForm>): string | null {
  if (!dados.nome) return "O nome é obrigatório.";
  if (isNaN(dados.preco) || dados.preco < 0) {
    return "O preço deve ser um número igual ou superior a 0.";
  }
  if (isNaN(dados.iva) || dados.iva < 0 || dados.iva > 100) {
    return "O ISS deve estar entre 0 e 100.";
  }
  return null;
}

export async function createProduto(
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
    .from("produtos")
    .insert({ ...dados, user_id: user.id });

  if (error) return { error: "Erro ao guardar o produto. Tenta novamente." };

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function updateProduto(
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

  const { error } = await supabase.from("produtos").update(dados).eq("id", id);

  if (error) return { error: "Erro ao atualizar o produto." };

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function deleteProduto(id: string) {
  const supabase = await createClient();
  await supabase.from("produtos").delete().eq("id", id);
  revalidatePath("/produtos");
}
