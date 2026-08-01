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

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: faturasData }, { count: totalClientes }, { count: totalProdutos }] =
    await Promise.all([
      supabase
        .from("faturas")
        .select(
          "*, clientes(nome), fatura_linhas(quantidade, preco_unitario, iva)"
        )
        .order("created_at", { ascending: false }),
      supabase.from("clientes").select("*", { count: "exact", head: true }),
      supabase.from("produtos").select("*", { count: "exact", head: true }),
    ]);

  const faturas = (faturasData ?? []) as FaturaCompleta[];

  const agora = new Date();
  const inicioMes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-01`;

  const ativas = faturas.filter(
    (f) => f.estado === "emitida" || f.estado === "paga"
  );
  const receitaMes = ativas
    .filter((f) => f.data_emissao >= inicioMes)
    .reduce((s, f) => s + calcTotais(f.fatura_linhas).total, 0);
  const pendentes = faturas.filter((f) => f.estado === "emitida");
  const valorPendente = pendentes.reduce(
    (s, f) => s + calcTotais(f.fatura_linhas).total,
    0
  );

  const cards = [
    {
      label: "Receita do mês",
      valor: formatEUR(receitaMes),
      icon: "bi-graph-up",
      cor: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "A receber",
      valor: formatEUR(valorPendente),
      icon: "bi-hourglass-split",
      cor: "bg-amber-100 text-amber-700",
    },
    {
      label: "Clientes",
      valor: String(totalClientes ?? 0),
      icon: "bi-people",
      cor: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Produtos",
      valor: String(totalProdutos ?? 0),
      icon: "bi-box-seam",
      cor: "bg-sky-100 text-sky-700",
    },
  ];

  const recentes = faturas.slice(0, 5);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Cartões de métricas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{c.label}</p>
              <span className={`rounded-lg p-2 ${c.cor}`}>
                <i className={`bi ${c.icon}`}></i>
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-800">{c.valor}</p>
          </div>
        ))}
      </div>

      {/* Faturas recentes */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-800">Faturas recentes</h2>
          <Link
            href="/faturas/nova"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            <i className="bi bi-plus-lg mr-1"></i> Nova fatura
          </Link>
        </div>

        {recentes.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            <p>Ainda não há atividade.</p>
            <p className="mt-1">
              Começa por{" "}
              <Link href="/clientes/novo" className="text-indigo-600 hover:underline">
                criar um cliente
              </Link>{" "}
              e depois emite a tua primeira fatura.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentes.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/faturas/${f.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {f.numero} · {f.clientes?.nome ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(f.data_emissao)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_BADGE[f.estado]}`}
                    >
                      {ESTADO_LABEL[f.estado]}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {formatEUR(calcTotais(f.fatura_linhas).total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
