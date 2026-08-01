"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createFatura, type FormState } from "@/app/(app)/faturas/actions";
import { formatEUR } from "@/lib/utils";
import type { Cliente, Produto } from "@/lib/types";

interface Linha {
  key: number;
  produto_id: string;
  descricao: string;
  quantidade: number;
  preco: number;
  iva: number;
  isencao: string;
}

let nextKey = 1;
const linhaVazia = (): Linha => ({
  key: nextKey++,
  produto_id: "",
  descricao: "",
  quantidade: 1,
  preco: 0,
  iva: 23,
  isencao: "",
});

const inputClass =
  "w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function FaturaForm({
  clientes,
  produtos,
}: {
  clientes: Cliente[];
  produtos: Produto[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createFatura,
    null
  );
  const [linhas, setLinhas] = useState<Linha[]>([linhaVazia()]);

  function atualizar(key: number, campo: keyof Linha, valor: string | number) {
    setLinhas((ls) =>
      ls.map((l) => (l.key === key ? { ...l, [campo]: valor } : l))
    );
  }

  function escolherProduto(key: number, produtoId: string) {
    const p = produtos.find((pr) => pr.id === produtoId);
    setLinhas((ls) =>
      ls.map((l) =>
        l.key === key
          ? {
              ...l,
              produto_id: produtoId,
              descricao: p ? p.nome : l.descricao,
              preco: p ? Number(p.preco) : l.preco,
              iva: p ? Number(p.iva) : l.iva,
              isencao: "",
            }
          : l
      )
    );
  }

  function alternarIsencao(key: number, ativo: boolean) {
    setLinhas((ls) =>
      ls.map((l) =>
        l.key === key
          ? {
              ...l,
              isencao: ativo ? "Isento — art.º 53.º do CIVA" : "",
              iva: ativo ? 0 : 23,
            }
          : l
      )
    );
  }

  const subtotal = linhas.reduce((s, l) => s + l.quantidade * l.preco, 0);
  const ivaTotal = linhas.reduce(
    (s, l) => s + l.quantidade * l.preco * (l.iva / 100),
    0
  );

  if (clientes.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Precisas de criar pelo menos um cliente antes de faturar.{" "}
        <Link href="/clientes/novo" className="font-medium underline">
          Criar cliente
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Cliente */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="cliente_id"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Cliente *
        </label>
        <select
          id="cliente_id"
          name="cliente_id"
          required
          defaultValue=""
          className={`${inputClass} max-w-md px-3`}
        >
          <option value="" disabled>
            Escolher cliente...
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Pagamento */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Pagamento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="data_vencimento"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Prazo de pagamento (vencimento)
            </label>
            <input
              id="data_vencimento"
              name="data_vencimento"
              type="date"
              className={`${inputClass} px-3`}
            />
          </div>
          <div>
            <label
              htmlFor="forma_pagamento"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Forma de pagamento
            </label>
            <select
              id="forma_pagamento"
              name="forma_pagamento"
              defaultValue=""
              className={`${inputClass} px-3`}
            >
              <option value="">Não especificar</option>
              <option>Transferência bancária</option>
              <option>MB WAY</option>
              <option>Multibanco</option>
              <option>Referência Multibanco</option>
              <option>Dinheiro</option>
              <option>Cartão</option>
            </select>
          </div>
        </div>
      </div>

      {/* Linhas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Linhas da fatura
        </h2>

        <div className="mb-2 hidden grid-cols-12 gap-2 text-xs font-medium uppercase text-slate-400 md:grid">
          <span className="col-span-3">Produto</span>
          <span className="col-span-4">Descrição</span>
          <span className="col-span-1">Qtd</span>
          <span className="col-span-2">Preço €</span>
          <span className="col-span-1">IVA %</span>
          <span className="col-span-1"></span>
        </div>

        <div className="space-y-3">
          {linhas.map((l) => (
            <div
              key={l.key}
              className="grid grid-cols-2 items-end gap-2 md:grid-cols-12"
            >
              <input type="hidden" name="produto_id" value={l.produto_id} />
              <input type="hidden" name="isencao" value={l.isencao} />

              <div className="col-span-2 md:col-span-3">
                <select
                  value={l.produto_id}
                  onChange={(e) => escolherProduto(l.key, e.target.value)}
                  className={inputClass}
                >
                  <option value="">Personalizado</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-4">
                <input
                  name="descricao"
                  value={l.descricao}
                  onChange={(e) => atualizar(l.key, "descricao", e.target.value)}
                  placeholder="Descrição *"
                  required
                  className={inputClass}
                />
              </div>

              <div className="col-span-1">
                <input
                  name="quantidade"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={l.quantidade}
                  onChange={(e) =>
                    atualizar(l.key, "quantidade", Number(e.target.value))
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <input
                  name="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  value={l.preco}
                  onChange={(e) => atualizar(l.key, "preco", Number(e.target.value))}
                  required
                  className={inputClass}
                />
              </div>

              <div className="col-span-1">
                <input
                  name="iva"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={l.iva}
                  onChange={(e) => atualizar(l.key, "iva", Number(e.target.value))}
                  disabled={l.isencao !== ""}
                  className={`${inputClass} disabled:bg-slate-100`}
                />
              </div>

              <div className="col-span-1 flex items-center justify-end gap-2">
                <label
                  title="Isento de IVA (art.º 53.º do CIVA)"
                  className="flex cursor-pointer items-center text-xs text-slate-500"
                >
                  <input
                    type="checkbox"
                    checked={l.isencao !== ""}
                    onChange={(e) => alternarIsencao(l.key, e.target.checked)}
                    className="mr-1 h-3.5 w-3.5 accent-indigo-600"
                  />
                  Isento
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setLinhas((ls) => ls.filter((x) => x.key !== l.key))
                  }
                  disabled={linhas.length === 1}
                  aria-label="Remover linha"
                  className="rounded-lg p-2 text-slate-400 hover:text-red-600 disabled:opacity-30"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLinhas((ls) => [...ls, linhaVazia()])}
          className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
        >
          <i className="bi bi-plus-lg mr-1"></i> Adicionar linha
        </button>

        <div className="mt-6 space-y-1 border-t border-slate-200 pt-4 text-right text-sm">
          <p className="text-slate-500">
            Subtotal: <span className="font-medium">{formatEUR(subtotal)}</span>
          </p>
          <p className="text-slate-500">
            IVA: <span className="font-medium">{formatEUR(ivaTotal)}</span>
          </p>
          <p className="text-lg font-bold text-slate-800">
            Total: {formatEUR(subtotal + ivaTotal)}
          </p>
        </div>
      </div>

      {/* Notas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="notas"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Notas
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={2}
          placeholder="Observações a incluir na fatura (opcional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "A criar..." : "Criar fatura"}
        </button>
        <Link
          href="/faturas"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
