import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProdutoForm } from "@/components/produto-form";
import type { Produto } from "@/lib/types";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Editar produto</h1>
      <ProdutoForm produto={data as Produto} />
    </div>
  );
}
