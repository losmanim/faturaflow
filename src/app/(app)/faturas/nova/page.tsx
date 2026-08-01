import { createClient } from "@/lib/supabase/server";
import { FaturaForm } from "@/components/fatura-form";
import type { Cliente, Perfil } from "@/lib/types";

export default async function NovaFaturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: clientes }, perfilResult] = await Promise.all([
    supabase.from("clientes").select("*").order("nome"),
    supabase
      .from("perfil")
      .select("*")
      .eq("user_id", user?.id ?? "")
      .maybeSingle(),
  ]);

  const perfil = perfilResult.error ? null : (perfilResult.data as Perfil | null);

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Nova nota fiscal de serviço
      </h1>
      {!perfil?.cnpj && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ainda não configurou a sua empresa emissora. Sem CNPJ e município
          (em{" "}
          <a href="/definicoes" className="font-medium underline">
            Definições
          </a>
          ) a nota não pode ser autorizada.
        </div>
      )}
      <FaturaForm
        clientes={(clientes ?? []) as Cliente[]}
        perfil={perfil}
      />
    </div>
  );
}
