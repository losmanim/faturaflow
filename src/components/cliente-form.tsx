"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createCliente,
  updateCliente,
  type FormState,
} from "@/app/(app)/clientes/actions";
import { Campo } from "@/components/campo";
import type { Cliente } from "@/lib/types";

export function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const action = cliente ? updateCliente : createCliente;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null
  );

  return (
    <form
      action={formAction}
      className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {cliente && <input type="hidden" name="id" value={cliente.id} />}

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Campo label="Nome *" name="nome" defaultValue={cliente?.nome ?? ""} required />
        <Campo
          label="CPF / CNPJ"
          name="cpf_cnpj"
          defaultValue={cliente?.cpf_cnpj ?? ""}
          maxLength={14}
          placeholder="CPF (11) ou CNPJ (14)"
        />
        <Campo
          label="Email"
          name="email"
          type="email"
          defaultValue={cliente?.email ?? ""}
        />
        <Campo
          label="Telefone"
          name="telefone"
          defaultValue={cliente?.telefone ?? ""}
        />
        <div className="md:col-span-2">
          <Campo
            label="Endereço"
            name="morada"
            defaultValue={cliente?.morada ?? ""}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "A guardar..." : "Guardar"}
        </button>
        <Link
          href="/clientes"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
