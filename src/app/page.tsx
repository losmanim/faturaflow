import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    icon: "bi-people",
    titulo: "Clientes & Produtos",
    texto: "Gere a tua base de clientes e catálogo de produtos com preços e IVA.",
  },
  {
    icon: "bi-receipt",
    titulo: "Faturas em segundos",
    texto: "Cria faturas com linhas de produtos, cálculo automático de IVA e numeração sequencial.",
  },
  {
    icon: "bi-graph-up",
    titulo: "Dashboard de receita",
    texto: "Acompanha a receita do mês, valores pendentes e o estado de cada fatura.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold">FaturaFlow</span>
        <Link
          href="/login"
          className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium hover:bg-white/10"
        >
          Entrar
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
          Faturação simples para a tua empresa
        </h1>
        <p className="mt-6 max-w-xl text-lg text-indigo-200">
          Clientes, produtos e faturas com IVA — num dashboard moderno.
          Sem complicações.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/registar"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-900 hover:bg-indigo-100"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10"
          >
            Entrar
          </Link>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.titulo}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur"
            >
              <i className={`bi ${f.icon} text-2xl text-indigo-300`}></i>
              <h2 className="mt-4 font-semibold">{f.titulo}</h2>
              <p className="mt-2 text-sm text-indigo-200">{f.texto}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-indigo-300">
        FaturaFlow — Next.js · TypeScript · Tailwind · Supabase
      </footer>
    </div>
  );
}
