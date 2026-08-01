"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/clientes", label: "Clientes", icon: "bi-people" },
  { href: "/produtos", label: "Produtos", icon: "bi-box-seam" },
  { href: "/faturas", label: "Faturas", icon: "bi-receipt" },
  { href: "/definicoes", label: "Definições", icon: "bi-gear" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-200 print:hidden">
      <Link
        href="/dashboard"
        className="px-6 py-5 text-xl font-bold text-white"
      >
        FaturaFlow
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <i className={`bi ${l.icon}`}></i>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <p className="mb-3 truncate text-xs text-slate-400" title={email}>
          {email}
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            <i className="bi bi-box-arrow-left"></i> Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
