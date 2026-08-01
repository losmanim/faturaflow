"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createFatura, type FormState } from "@/app/(app)/faturas/actions";
import { formatBRL } from "@/lib/utils";
import type { Cliente, Perfil } from "@/lib/types";

interface Linha {
  key: number;
  descricao: string;
  quantidade: number;
  preco: number;
  iss: number;
  nbs: string;
}

let nextKey = 1;
const linhaVazia = (iss = 0, nbs = ""): Linha => ({
  key: nextKey++,
  descricao: "",
  quantidade: 1,
  preco: 0,
  iss,
  nbs,
});

const inputClass =
  "w-full rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function FaturaForm({
  clientes,
  perfil,
}: {
  clientes: Cliente[];
  perfil?: Perfil | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createFatura,
    null
  );
  const [linhas, setLinhas] = useState<Linha[]>([
    linhaVazia(Number(perfil?.aliq_iss ?? 0), perfil?.nbs_default ?? ""),
  ]);

  function atualizar(key: number, campo: keyof Linha, valor: string | number) {
    setLinhas((ls) =>
      ls.map((l) => (l.key === key ? { ...l, [campo]: valor } : l))
    );
  }

  const subtotal = linhas.reduce((s, l) => s + l.quantidade * l.preco, 0);
  const issTotal = linhas.reduce(
    (s, l) => s + l.quantidade * l.preco * (l.iss / 100),
    0
  );

  const simNacional =
    !perfil || perfil.regime_tributario === "MEI" || perfil.regime_tributario === "Simples Nacional";

  if (clientes.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Precisa de criar pelo menos um cliente (tomador) antes de emitir.{" "}
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

      {/* Tomador + competência */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cliente_id"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Tomador (cliente) *
            </label>
            <select
              id="cliente_id"
              name="cliente_id"
              required
              defaultValue=""
              className={`${inputClass} px-3`}
            >
              <option value="" disabled>
                Escolher cliente...
              </option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                  {c.cpf_cnpj ? ` — ${c.cpf_cnpj}` : " (sem CPF/CNPJ)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="competencia"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Competência (mês da prestação)
            </label>
            <input
              id="competencia"
              name="competencia"
              type="month"
              className={`${inputClass} px-3`}
            />
          </div>
        </div>
      </div>

      {/* Serviços */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Serviços prestados
          </h2>
          {simNacional && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
              Simples Nacional — ISS recolhido via DAS (alíquota 0%)
            </span>
          )}
        </div>

        <div className="mb-2 hidden grid-cols-12 gap-2 text-xs font-medium uppercase text-slate-400 md:grid">
          <span className="col-span-4">Descrição</span>
          <span className="col-span-3">Código NBS</span>
          <span className="col-span-1">Qtd</span>
          <span className="col-span-2">Valor R$</span>
          <span className="col-span-1">ISS %</span>
          <span className="col-span-1"></span>
        </div>

        <div className="space-y-3">
          {linhas.map((l) => (
            <div
              key={l.key}
              className="grid grid-cols-2 items-end gap-2 md:grid-cols-12"
            >
              <div className="col-span-2 md:col-span-4">
                <input
                  name="descricao"
                  value={l.descricao}
                  onChange={(e) => atualizar(l.key, "descricao", e.target.value)}
                  placeholder="Descrição do serviço *"
                  required
                  className={inputClass}
                />
              </div>

              <div className="col-span-1 md:col-span-3">
                <input
                  name="nbs"
                  value={l.nbs}
                  onChange={(e) => atualizar(l.key, "nbs", e.target.value)}
                  placeholder="Ex.: 1.01.01"
                  required
                  className={inputClass}
                />
              </div>

              <div className="col-span-1 md:col-span-1">
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

              <div className="col-span-1 md:col-span-1">
                <input
                  name="iss"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={l.iss}
                  onChange={(e) => atualizar(l.key, "iss", Number(e.target.value))}
                  className={`${inputClass} disabled:bg-slate-100`}
                />
              </div>

              <div className="col-span-1 flex items-center justify-end">
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
          onClick={() =>
            setLinhas((ls) => [
              ...ls,
              linhaVazia(Number(perfil?.aliq_iss ?? 0), ""),
            ])
          }
          className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
        >
          <i className="bi bi-plus-lg mr-1"></i> Adicionar serviço
        </button>

        <div className="mt-6 space-y-1 border-t border-slate-200 pt-4 text-right text-sm">
          <p className="text-slate-500">
            Valor dos serviços:{" "}
            <span className="font-medium">{formatBRL(subtotal)}</span>
          </p>
          {issTotal > 0 && (
            <p className="text-slate-500">
              ISS: <span className="font-medium">{formatBRL(issTotal)}</span>
            </p>
          )}
          <p className="text-lg font-bold text-slate-800">
            Total: {formatBRL(subtotal + issTotal)}
          </p>
        </div>
      </div>

      {/* Notas */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="notas"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Observações
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={2}
          placeholder="Informações complementares (opcional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "A criar..." : "Criar nota (rascunho)"}
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
