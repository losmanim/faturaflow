import { createClient } from "@/lib/supabase/server";
import { FaturaForm } from "@/components/fatura-form";
import type { Cliente, Produto } from "@/lib/types";

export default async function NovaFaturaPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: produtos }] = await Promise.all([
    supabase.from("clientes").select("*").order("nome"),
    supabase.from("produtos").select("*").order("nome"),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Nova fatura</h1>
      <FaturaForm
        clientes={(clientes ?? []) as Cliente[]}
        produtos={(produtos ?? []) as Produto[]}
      />
    </div>
  );
}
