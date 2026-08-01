import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    icon: "bi-people",
    titulo: "Clientes & Produtos",
    texto: "Base de clientes com NIF e catálogo de produtos com preços e IVA configuráveis.",
  },
  {
    icon: "bi-receipt",
    titulo: "Faturas com IVA automático",
    texto: "Linhas dinâmicas com cálculo de totais em tempo real e numeração sequencial (FT 2026/0001).",
  },
  {
    icon: "bi-arrow-repeat",
    titulo: "Estados da fatura",
    texto: "Fluxo controlado: rascunho → emitida → paga (ou anulada). Só rascunhos podem ser eliminados.",
  },
  {
    icon: "bi-printer",
    titulo: "Exportação em PDF",
    texto: "Documento de fatura profissional, pronto para imprimir ou guardar como PDF.",
  },
  {
    icon: "bi-graph-up",
    titulo: "Dashboard de métricas",
    texto: "Receita do mês, valores a receber, totais de clientes e produtos, e faturas recentes.",
  },
  {
    icon: "bi-shield-lock",
    titulo: "Segurança por desenho",
    texto: "Row Level Security na base de dados — cada utilizador só acede aos próprios dados.",
  },
];

const passos = [
  {
    n: "1",
    titulo: "Regista clientes e produtos",
    texto: "Cria a tua base em segundos — nome, NIF, preços e IVA.",
  },
  {
    n: "2",
    titulo: "Emite a fatura",
    texto: "Escolhe o cliente, adiciona linhas a partir do catálogo e o total calcula-se sozinho.",
  },
  {
    n: "3",
    titulo: "Acompanha a receita",
    texto: "Marca como paga e vê o dashboard atualizar em tempo real.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white">
      {/* Navegação */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-indigo-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold">FaturaFlow</span>
          <nav className="hidden items-center gap-6 text-sm text-indigo-200 md:flex">
            <a href="#funcionalidades" className="hover:text-white">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="hover:text-white">
              Como funciona
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-indigo-200 hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/registar"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-100"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-16 text-center md:pt-24">
        <span className="inline-block rounded-full border border-indigo-400/40 bg-indigo-400/10 px-4 py-1 text-xs font-medium text-indigo-300">
          Faturação com IVA automático · Feito para PMEs
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
          Faturação simples para a tua empresa
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-indigo-200">
          Clientes, produtos e faturas profissionais com cálculo de IVA —
          num dashboard moderno. Sem complicações.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/registar"
            className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-indigo-900 hover:bg-indigo-100"
          >
            Começar agora — é grátis
          </Link>
          <a
            href="#funcionalidades"
            className="rounded-lg border border-white/30 px-8 py-3 text-sm font-semibold hover:bg-white/10"
          >
            Ver funcionalidades
          </a>
        </div>

        {/* Mockup do dashboard */}
        <div className="mx-auto mt-16 max-w-4xl rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur">
          <div className="overflow-hidden rounded-lg bg-slate-50 text-left shadow-2xl">
            {/* Barra do browser */}
            <div className="flex items-center gap-1.5 bg-slate-200 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span className="ml-3 flex-1 rounded bg-white px-2 py-0.5 text-[10px] text-slate-400">
                faturaflow.vercel.app/dashboard
              </span>
            </div>
            <div className="flex">
              {/* Mini sidebar */}
              <div className="hidden w-32 shrink-0 space-y-2 bg-slate-900 p-3 sm:block">
                <div className="mb-3 h-2.5 w-16 rounded bg-indigo-400"></div>
                <div className="h-2 w-full rounded bg-indigo-600"></div>
                <div className="h-2 w-4/5 rounded bg-slate-700"></div>
                <div className="h-2 w-4/5 rounded bg-slate-700"></div>
                <div className="h-2 w-4/5 rounded bg-slate-700"></div>
              </div>
              {/* Mini conteúdo */}
              <div className="flex-1 space-y-3 p-4">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[
                    { label: "Receita do mês", valor: "3 450,00 €", cor: "bg-emerald-100" },
                    { label: "A receber", valor: "861,00 €", cor: "bg-amber-100" },
                    { label: "Clientes", valor: "12", cor: "bg-indigo-100" },
                    { label: "Produtos", valor: "8", cor: "bg-sky-100" },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="rounded-lg border border-slate-200 bg-white p-2.5"
                    >
                      <div className={`mb-1.5 h-4 w-4 rounded ${c.cor}`}></div>
                      <p className="text-[9px] text-slate-400">{c.label}</p>
                      <p className="text-xs font-bold text-slate-700">{c.valor}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white">
                  {[
                    { n: "FT 2026/0012", c: "Padaria Central", v: "307,50 €", e: "Paga", cor: "bg-emerald-100 text-emerald-700" },
                    { n: "FT 2026/0011", c: "Oficina Silva", v: "861,00 €", e: "Emitida", cor: "bg-amber-100 text-amber-700" },
                    { n: "FT 2026/0010", c: "Café Avenida", v: "492,00 €", e: "Paga", cor: "bg-emerald-100 text-emerald-700" },
                  ].map((f) => (
                    <div
                      key={f.n}
                      className="flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-0"
                    >
                      <div>
                        <p className="text-[10px] font-semibold text-slate-700">
                          {f.n} · {f.c}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${f.cor}`}>
                          {f.e}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700">{f.v}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="border-t border-white/10 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">
            Tudo o que precisas para faturar
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-indigo-200">
            Do cliente à fatura paga — um fluxo completo e simples.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.titulo}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-indigo-400/40"
              >
                <i className={`bi ${f.icon} text-2xl text-indigo-300`}></i>
                <h3 className="mt-4 font-semibold">{f.titulo}</h3>
                <p className="mt-2 text-sm text-indigo-200">{f.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="border-t border-white/10 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Como funciona</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {passos.map((p) => (
              <div key={p.n} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-lg font-bold">
                  {p.n}
                </span>
                <h3 className="mt-4 font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-indigo-200">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-white/10 py-20 text-center">
        <h2 className="text-3xl font-bold">Pronto para começar?</h2>
        <p className="mx-auto mt-3 max-w-md text-indigo-200">
          Cria a tua conta e emite a primeira fatura em menos de 5 minutos.
        </p>
        <Link
          href="/registar"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-indigo-900 hover:bg-indigo-100"
        >
          Criar conta grátis
        </Link>
        <p className="mt-8 text-xs text-indigo-300">
          Construído com Next.js · TypeScript · Tailwind · Supabase
        </p>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-indigo-300">
        FaturaFlow © 2026 · Projeto de{" "}
        <a
          href="https://github.com/losmanim/faturaflow"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          código aberto
        </a>
      </footer>
    </div>
  );
}
