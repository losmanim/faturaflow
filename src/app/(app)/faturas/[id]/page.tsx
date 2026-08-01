import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteFatura } from "../actions";
import { PrintButton } from "@/components/print-button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { NotaActions } from "@/components/nota-actions";
import {
  formatBRL,
  formatDate,
  formatDocumento,
  calcTotais,
  resumoISS,
  NOTA_BADGE,
  NOTA_LABEL,
} from "@/lib/utils";
import type { FaturaCompleta, Perfil } from "@/lib/types";

export default async function FaturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("faturas")
    .select("*, clientes(*), fatura_linhas(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const fatura = data as FaturaCompleta;
  const totais = calcTotais(fatura.fatura_linhas);
  const issResumo = resumoISS(fatura.fatura_linhas);
  const { data: auth } = await supabase.auth.getUser();

  // Dados da empresa emissora (Definições)
  let perfil: Perfil | null = null;
  if (auth.user) {
    const r = await supabase
      .from("perfil")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!r.error) perfil = r.data as Perfil | null;
  }

  const simNacional =
    !perfil ||
    perfil.regime_tributario === "MEI" ||
    perfil.regime_tributario === "Simples Nacional";

  const emitivel = fatura.status_nota === "nao_emitida" || fatura.status_nota === "rejeitada";
  const autorizada = fatura.status_nota === "autorizada";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de ações — não aparece na impressão */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/faturas"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          <i className="bi bi-arrow-left mr-1"></i> Voltar às notas
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {fatura.estado === "rascunho" && (
            <ConfirmDelete
              action={deleteFatura.bind(null, fatura.id)}
              label="Eliminar rascunho"
            />
          )}
          <PrintButton />
        </div>
      </div>

      {/* Estado + ações de emissão */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <p className="text-sm text-slate-500">Status da NFS-e</p>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${NOTA_BADGE[fatura.status_nota]}`}
          >
            {NOTA_LABEL[fatura.status_nota]}
          </span>
        </div>
        <NotaActions id={fatura.id} status={fatura.status_nota} />
      </div>

      {fatura.status_nota === "rejeitada" && fatura.motivo_rejeicao && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 print:hidden">
          <p className="font-medium">Nota rejeitada pelo município:</p>
          <p className="mt-1">{fatura.motivo_rejeicao}</p>
        </div>
      )}

      {/* Documento da NFS-e */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-12 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-lg font-bold text-slate-800">
              {perfil?.razao_social || perfil?.nome || "FaturaFlow-BR"}
            </p>
            {perfil?.cnpj && (
              <p className="text-sm text-slate-600">
                CNPJ: {formatDocumento(perfil.cnpj)}
              </p>
            )}
            {perfil?.inscricao_municipal && (
              <p className="text-sm text-slate-600">
                Inscrição Municipal: {perfil.inscricao_municipal}
              </p>
            )}
            {perfil?.municipio && (
              <p className="text-sm text-slate-600">{perfil.municipio}</p>
            )}
            {perfil?.email && (
              <p className="text-sm text-slate-600">{perfil.email}</p>
            )}
            <p className="text-sm text-slate-600">
              Regime: {perfil?.regime_tributario ?? "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold uppercase tracking-wide text-slate-800">
              NFS-e
            </p>
            <p className="mt-2 text-lg font-bold text-slate-800">
              {fatura.numero}
            </p>
            <p className="text-sm text-slate-500">
              Emitida a {formatDate(fatura.data_emissao)}
            </p>
            {fatura.competencia && (
              <p className="text-sm text-slate-500">
                Competência: {formatDate(fatura.competencia)}
              </p>
            )}
            {autorizada && fatura.numero_nfse && (
              <p className="mt-1 text-sm text-slate-600">
                Nº NFS-e: {fatura.numero_nfse}
              </p>
            )}
            {autorizada && fatura.codigo_verificacao && (
              <p className="text-sm text-slate-600">
                Código de verificação: {fatura.codigo_verificacao}
              </p>
            )}
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${NOTA_BADGE[fatura.status_nota]}`}
            >
              {NOTA_LABEL[fatura.status_nota]}
            </span>
          </div>
        </div>

        {/* Tomador */}
        <div className="border-b border-slate-200 py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Tomador dos serviços
          </p>
          <p className="mt-2 font-semibold text-slate-800">
            {fatura.clientes?.nome ?? "—"}
          </p>
          {fatura.clientes?.cpf_cnpj && (
            <p className="text-sm text-slate-600">
              CPF/CNPJ: {formatDocumento(fatura.clientes.cpf_cnpj)}
            </p>
          )}
          {fatura.clientes?.morada && (
            <p className="text-sm text-slate-600">{fatura.clientes.morada}</p>
          )}
          {fatura.clientes?.email && (
            <p className="text-sm text-slate-600">{fatura.clientes.email}</p>
          )}
        </div>

        {/* Serviços */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
              <th className="py-2 pr-4 font-medium">Descrição</th>
              <th className="py-2 pr-4 text-left font-medium">NBS</th>
              <th className="py-2 pr-4 text-right font-medium">Qtd</th>
              <th className="py-2 pr-4 text-right font-medium">Valor</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fatura.fatura_linhas.map((l) => (
              <tr key={l.id}>
                <td className="py-3 pr-4 text-slate-800">{l.descricao}</td>
                <td className="py-3 pr-4 text-slate-600">{l.nbs ?? "—"}</td>
                <td className="py-3 pr-4 text-right text-slate-600">
                  {Number(l.quantidade)}
                </td>
                <td className="py-3 pr-4 text-right text-slate-600">
                  {formatBRL(Number(l.preco_unitario))}
                </td>
                <td className="py-3 text-right font-medium text-slate-800">
                  {formatBRL(Number(l.quantidade) * Number(l.preco_unitario))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais */}
        <div className="mt-6 flex justify-end">
          <div className="w-80 space-y-2 border-t border-slate-200 pt-4 text-sm">
            {issResumo
              .filter((r) => r.aliquota > 0)
              .map((r) => (
                <div key={r.aliquota} className="flex justify-between text-slate-600">
                  <span>
                    ISS ({r.aliquota}%) sobre {formatBRL(r.base)}
                  </span>
                  <span>{formatBRL(r.iss)}</span>
                </div>
              ))}
            <div className="flex justify-between text-slate-600">
              <span>Valor dos serviços</span>
              <span>{formatBRL(totais.subtotal)}</span>
            </div>
            {totais.issTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>ISS</span>
                <span>{formatBRL(totais.issTotal)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-800">
              <span>Valor total</span>
              <span>{formatBRL(totais.total)}</span>
            </div>
          </div>
        </div>

        {/* Simples Nacional / observações */}
        <div className="mt-8 space-y-3">
          {simNacional && (
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800 print:bg-transparent print:p-0">
              Impostos (ISS, PIS, COFINS, CSLL, IBS e CBS) recolhidos na forma do
              Simples Nacional — Lei Complementar nº 123/2006, art.º 21.ª.
            </p>
          )}
          {fatura.notas && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 print:bg-transparent print:p-0">
              <span className="font-medium text-slate-700">Observações: </span>
              {fatura.notas}
            </div>
          )}
        </div>

        {/* Protocolo de autorização */}
        {autorizada && (
          <div className="mt-8 rounded-xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Dados da autorização
            </p>
            <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
              {fatura.protocolo && (
                <p>
                  <span className="font-medium text-slate-700">Protocolo: </span>
                  {fatura.protocolo}
                </p>
              )}
              {fatura.data_autorizacao && (
                <p>
                  <span className="font-medium text-slate-700">
                    Autorizada a:{" "}
                  </span>
                  {formatDate(fatura.data_autorizacao)}
                </p>
              )}
            </div>
            {fatura.xml_nota && (
              <a
                href={`data:text/xml;charset=utf-8,${encodeURIComponent(fatura.xml_nota)}`}
                download={`nfse-${fatura.numero_nfse}.xml`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline print:hidden"
              >
                <i className="bi bi-file-earmark-code"></i> Baixar XML autorizado
              </a>
            )}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-slate-400">
          Documento de demonstração — FaturaFlow-BR
        </p>
      </div>
    </div>
  );
}
