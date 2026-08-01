"use client";

import { useActionState } from "react";
import { savePerfil, type SettingsState } from "@/app/(app)/definicoes/actions";
import { Campo } from "@/components/campo";
import type { Perfil, RegimeTributario } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const REGIMES: RegimeTributario[] = [
  "MEI",
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
];

export function PerfilForm({ perfil }: { perfil?: Perfil | null }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    savePerfil,
    null
  );

  const simNacional =
    !perfil ||
    perfil.regime_tributario === "MEI" ||
    perfil.regime_tributario === "Simples Nacional";

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
        <Campo label="Nome fantasia" name="nome" defaultValue={perfil?.nome ?? ""} />
        <Campo
          label="Razão social *"
          name="razao_social"
          defaultValue={perfil?.razao_social ?? ""}
          required
        />
        <Campo
          label="CNPJ *"
          name="cnpj"
          defaultValue={perfil?.cnpj ?? ""}
          maxLength={14}
          placeholder="14 dígitos"
        />
        <Campo
          label="Inscrição Municipal"
          name="inscricao_municipal"
          defaultValue={perfil?.inscricao_municipal ?? ""}
        />
        <div>
          <label
            htmlFor="regime_tributario"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Regime tributário
          </label>
          <select
            id="regime_tributario"
            name="regime_tributario"
            defaultValue={perfil?.regime_tributario ?? "MEI"}
            className={inputClass}
          >
            {REGIMES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <Campo
          label="Código do município (IBGE) *"
          name="codigo_municipio"
          defaultValue={perfil?.codigo_municipio ?? ""}
          maxLength={7}
          placeholder="7 dígitos"
        />
        <Campo
          label="Município"
          name="municipio"
          defaultValue={perfil?.municipio ?? ""}
          placeholder="Ex.: São Paulo"
        />
        <Campo
          label="Alíquota ISS (%) *"
          name="aliq_iss"
          type="number"
          step="0.1"
          min="0"
          max="100"
          defaultValue={perfil ? Number(perfil.aliq_iss) : 0}
        />
        <Campo
          label="Código de serviço padrão (NBS)"
          name="nbs_default"
          defaultValue={perfil?.nbs_default ?? ""}
          placeholder="Ex.: 1.01.01"
        />
        <div className="md:col-span-2">
          <Campo label="Endereço" name="morada" defaultValue={perfil?.morada ?? ""} />
        </div>
        <Campo label="Email" name="email" type="email" defaultValue={perfil?.email ?? ""} />
        <Campo label="Telefone" name="telefone" defaultValue={perfil?.telefone ?? ""} />
      </div>

      <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800">
        No {simNacional ? "MEI/Simples Nacional" : "seu regime"} o ISS é recolhido
        {simNacional ? " via DAS — mantém a alíquota a 0% nas notas." : " pela prefeitura — define a alíquota do seu município."}
      </p>

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
