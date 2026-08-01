import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "@/components/perfil-form";
import type { Perfil } from "@/lib/types";

export default async function DefinicoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let perfil: Perfil | null = null;
  const r = await supabase
    .from("perfil")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();
  if (!r.error) perfil = r.data as Perfil | null;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Definições</h1>
      <p className="mb-6 text-sm text-slate-500">
        Estes dados aparecem como fornecedor nas faturas que emites.
      </p>

      {perfil === null && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ainda não configuraste a tua empresa. Preenche abaixo — as faturas
          passam a apresentar estes dados.
        </div>
      )}

      <PerfilForm perfil={perfil} />
    </div>
  );
}
