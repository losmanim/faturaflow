"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createProduto,
  updateProduto,
  type FormState,
} from "@/app/(app)/produtos/actions";
import { Campo } from "@/components/campo";
import type { Produto } from "@/lib/types";

export function ProdutoForm({ produto }: { produto?: Produto }) {
  const action = produto ? updateProduto : createProduto;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    null
  );

  return (
    <form
      action={formAction}
      className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {produto && <input type="hidden" name="id" value={produto.id} />}

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Campo
          label="Nome *"
          name="nome"
          defaultValue={produto?.nome ?? ""}
          required
        />
        <Campo
          label="Descrição"
          name="descricao"
          defaultValue={produto?.descricao ?? ""}
        />
        <Campo
          label="Preço (€) *"
          name="preco"
          type="number"
          step="0.01"
          min="0"
          defaultValue={produto ? Number(produto.preco) : ""}
          required
        />
        <Campo
          label="IVA (%) *"
          name="iva"
          type="number"
          step="0.1"
          min="0"
          defaultValue={produto ? Number(produto.iva) : 23}
          required
        />
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
          href="/produtos"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
