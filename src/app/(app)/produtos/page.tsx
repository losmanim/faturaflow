import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduto } from "./actions";
import { ConfirmDelete } from "@/components/confirm-delete";
import { formatEUR } from "@/lib/utils";
import type { Produto } from "@/lib/types";

export default async function ProdutosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .order("created_at", { ascending: false });

  const produtos = (data ?? []) as Produto[];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
          <p className="text-sm text-slate-500">
            {produtos.length}{" "}
            {produtos.length === 1 ? "produto no catálogo" : "produtos no catálogo"}
          </p>
        </div>
        <Link
          href="/produtos/novo"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <i className="bi bi-plus-lg mr-1"></i> Novo produto
        </Link>
      </header>

      {produtos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <i className="bi bi-box-seam text-4xl text-slate-300"></i>
          <p className="mt-4 text-slate-500">Ainda não tens produtos.</p>
          <Link
            href="/produtos/novo"
            className="mt-2 inline-block font-medium text-indigo-600 hover:underline"
          >
            Adicionar o primeiro produto
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 text-right font-medium">Preço</th>
                <th className="px-6 py-3 text-right font-medium">IVA</th>
                <th className="px-6 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {p.nome}
                  </td>
                  <td className="max-w-xs truncate px-6 py-3 text-slate-600">
                    {p.descricao ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-800">
                    {formatEUR(Number(p.preco))}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    {Number(p.iva)}%
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/produtos/${p.id}/editar`}
                      className="mr-4 text-sm text-indigo-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <ConfirmDelete action={deleteProduto.bind(null, p.id)} />
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
