import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteCliente } from "./actions";
import { ConfirmDelete } from "@/components/confirm-delete";
import type { Cliente } from "@/lib/types";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  const clientes = (data ?? []) as Cliente[];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500">
            {clientes.length}{" "}
            {clientes.length === 1 ? "cliente registado" : "clientes registados"}
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <i className="bi bi-plus-lg mr-1"></i> Novo cliente
        </Link>
      </header>

      {clientes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <i className="bi bi-people text-4xl text-slate-300"></i>
          <p className="mt-4 text-slate-500">Ainda não tens clientes.</p>
          <Link
            href="/clientes/novo"
            className="mt-2 inline-block font-medium text-indigo-600 hover:underline"
          >
            Adicionar o primeiro cliente
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">NIF</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Telefone</th>
                <th className="px-6 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {c.nome}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{c.nif ?? "—"}</td>
                  <td className="px-6 py-3 text-slate-600">{c.email ?? "—"}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {c.telefone ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/clientes/${c.id}/editar`}
                      className="mr-4 text-sm text-indigo-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <ConfirmDelete action={deleteCliente.bind(null, c.id)} />
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
