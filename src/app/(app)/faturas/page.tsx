import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatEUR,
  formatDate,
  calcTotais,
  ESTADO_BADGE,
  ESTADO_LABEL,
} from "@/lib/utils";
import type { FaturaCompleta } from "@/lib/types";

export default async function FaturasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faturas")
    .select("*, clientes(nome), fatura_linhas(quantidade, preco_unitario, iva)")
    .order("created_at", { ascending: false });

  const faturas = (data ?? []) as FaturaCompleta[];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faturas</h1>
          <p className="text-sm text-slate-500">
            {faturas.length}{" "}
            {faturas.length === 1 ? "fatura emitida" : "faturas no total"}
          </p>
        </div>
        <Link
          href="/faturas/nova"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <i className="bi bi-plus-lg mr-1"></i> Nova fatura
        </Link>
      </header>

      {faturas.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <i className="bi bi-receipt text-4xl text-slate-300"></i>
          <p className="mt-4 text-slate-500">Ainda não tens faturas.</p>
          <Link
            href="/faturas/nova"
            className="mt-2 inline-block font-medium text-indigo-600 hover:underline"
          >
            Criar a primeira fatura
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Número</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faturas.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <Link
                      href={`/faturas/${f.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {f.numero}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-slate-800">
                    {f.clientes?.nome ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {formatDate(f.data_emissao)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_BADGE[f.estado]}`}
                    >
                      {ESTADO_LABEL[f.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-800">
                    {formatEUR(calcTotais(f.fatura_linhas).total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
