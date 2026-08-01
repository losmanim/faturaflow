import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateEstadoFatura, deleteFatura } from "../actions";
import { PrintButton } from "@/components/print-button";
import { ConfirmDelete } from "@/components/confirm-delete";
import {
  formatEUR,
  formatDate,
  calcTotais,
  ESTADO_BADGE,
  ESTADO_LABEL,
} from "@/lib/utils";
import type { FaturaCompleta } from "@/lib/types";

const btnAcao =
  "rounded-lg px-4 py-2 text-sm font-medium transition";

export default async function FaturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("faturas")
    .select("*, clientes(nome, nif, email, morada), fatura_linhas(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const fatura = data as FaturaCompleta;
  const totais = calcTotais(fatura.fatura_linhas);
  const { data: auth } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de ações — não aparece na impressão */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/faturas"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          <i className="bi bi-arrow-left mr-1"></i> Voltar às faturas
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {fatura.estado === "rascunho" && (
            <>
              <form action={updateEstadoFatura.bind(null, fatura.id, "emitida")}>
                <button
                  className={`${btnAcao} bg-indigo-600 text-white hover:bg-indigo-700`}
                >
                  <i className="bi bi-send mr-1"></i> Emitir fatura
                </button>
              </form>
              <ConfirmDelete
                action={deleteFatura.bind(null, fatura.id)}
                label="Eliminar rascunho"
              />
            </>
          )}
          {fatura.estado === "emitida" && (
            <>
              <form action={updateEstadoFatura.bind(null, fatura.id, "paga")}>
                <button
                  className={`${btnAcao} bg-emerald-600 text-white hover:bg-emerald-700`}
                >
                  <i className="bi bi-check-lg mr-1"></i> Marcar como paga
                </button>
              </form>
              <form action={updateEstadoFatura.bind(null, fatura.id, "anulada")}>
                <button
                  className={`${btnAcao} border border-red-300 text-red-600 hover:bg-red-50`}
                >
                  Anular
                </button>
              </form>
            </>
          )}
          <PrintButton />
        </div>
      </div>

      {/* Documento da fatura */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-12 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-2xl font-bold text-indigo-600">FaturaFlow</p>
            <p className="mt-1 text-sm text-slate-500">
              {auth.user?.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">{fatura.numero}</p>
            <p className="text-sm text-slate-500">
              Emitida a {formatDate(fatura.data_emissao)}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${ESTADO_BADGE[fatura.estado]}`}
            >
              {ESTADO_LABEL[fatura.estado]}
            </span>
          </div>
        </div>

        {/* Cliente */}
        <div className="border-b border-slate-200 py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Faturado a
          </p>
          <p className="mt-2 font-semibold text-slate-800">
            {fatura.clientes?.nome ?? "—"}
          </p>
          {fatura.clientes?.nif && (
            <p className="text-sm text-slate-600">
              NIF: {fatura.clientes.nif}
            </p>
          )}
          {fatura.clientes?.morada && (
            <p className="text-sm text-slate-600">{fatura.clientes.morada}</p>
          )}
          {fatura.clientes?.email && (
            <p className="text-sm text-slate-600">{fatura.clientes.email}</p>
          )}
        </div>

        {/* Linhas */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
              <th className="py-2 pr-4 font-medium">Descrição</th>
              <th className="py-2 pr-4 text-right font-medium">Qtd</th>
              <th className="py-2 pr-4 text-right font-medium">Preço</th>
              <th className="py-2 pr-4 text-right font-medium">IVA</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fatura.fatura_linhas.map((l) => (
              <tr key={l.id}>
                <td className="py-3 pr-4 text-slate-800">{l.descricao}</td>
                <td className="py-3 pr-4 text-right text-slate-600">
                  {Number(l.quantidade)}
                </td>
                <td className="py-3 pr-4 text-right text-slate-600">
                  {formatEUR(Number(l.preco_unitario))}
                </td>
                <td className="py-3 pr-4 text-right text-slate-600">
                  {Number(l.iva)}%
                </td>
                <td className="py-3 text-right font-medium text-slate-800">
                  {formatEUR(Number(l.quantidade) * Number(l.preco_unitario))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatEUR(totais.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA</span>
              <span>{formatEUR(totais.ivaTotal)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-800">
              <span>Total</span>
              <span>{formatEUR(totais.total)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        {fatura.notas && (
          <div className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 print:bg-transparent print:p-0 print:pt-4">
            <span className="font-medium text-slate-700">Notas: </span>
            {fatura.notas}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-400">
          Documento gerado por FaturaFlow — demonstração
        </p>
      </div>
    </div>
  );
}
