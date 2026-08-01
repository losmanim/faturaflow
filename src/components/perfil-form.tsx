"use client";

import { useActionState } from "react";
import { savePerfil, type SettingsState } from "@/app/(app)/definicoes/actions";
import { Campo } from "@/components/campo";
import type { Perfil } from "@/lib/types";

export function PerfilForm({ perfil }: { perfil?: Perfil | null }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    savePerfil,
    null
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state?.ok && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message}
        </div>
      )}
      {state && !state.ok && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Campo label="Nome / Razão social" name="nome" defaultValue={perfil?.nome ?? ""} />
        <Campo
          label="NIF"
          name="nif"
          defaultValue={perfil?.nif ?? ""}
          maxLength={9}
          placeholder="9 dígitos"
        />
        <div className="md:col-span-2">
          <Campo label="Morada / Sede" name="morada" defaultValue={perfil?.morada ?? ""} />
        </div>
        <Campo label="Email" name="email" type="email" defaultValue={perfil?.email ?? ""} />
        <Campo label="Telefone" name="telefone" defaultValue={perfil?.telefone ?? ""} />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
