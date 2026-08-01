import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "@/components/cliente-form";
import type { Cliente } from "@/lib/types";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Editar cliente</h1>
      <ClienteForm cliente={data as Cliente} />
    </div>
  );
}
