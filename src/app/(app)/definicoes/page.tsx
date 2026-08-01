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
        Dados da empresa emissora — aparecem no cabeçalho das NFS-e e são
        obrigatórios para emitir (CNPJ, razão social e município).
      </p>

      {perfil === null && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ainda não configurou a sua empresa. Preencha abaixo — as notas
          passam a apresentar estes dados.
        </div>
      )}

      <PerfilForm perfil={perfil} />
    </div>
  );
}
