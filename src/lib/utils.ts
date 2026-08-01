/** Formata um número como moeda EUR (pt-PT). */
export function formatEUR(valor: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(valor);
}

/** Formata uma data ISO (ou 'YYYY-MM-DD') para pt-PT. */
export function formatDate(iso: string): string {
  const normalizada = iso.length === 10 ? `${iso}T00:00:00` : iso;
  return new Date(normalizada).toLocaleDateString("pt-PT");
}

/** Calcula subtotal, IVA e total de uma lista de linhas de fatura. */
export function calcTotais(
  linhas: { quantidade: number; preco_unitario: number; iva: number }[]
) {
  const subtotal = linhas.reduce((s, l) => s + l.quantidade * l.preco_unitario, 0);
  const ivaTotal = linhas.reduce(
    (s, l) => s + l.quantidade * l.preco_unitario * (l.iva / 100),
    0
  );
  return { subtotal, ivaTotal, total: subtotal + ivaTotal };
}

/**
 * Resumo de IVA agrupado por taxa (para a fatura).
 * Linhas com isenção são somadas à parte.
 */
export function resumoIVA(
  linhas: { quantidade: number; preco_unitario: number; iva: number; isencao?: string | null }[]
) {
  const porTaxa = new Map<number, { taxa: number; base: number; iva: number }>();
  let isento = 0;

  for (const l of linhas) {
    const base = l.quantidade * l.preco_unitario;
    if (l.isencao) {
      isento += base;
      continue;
    }
    const taxa = Number(l.iva);
    const atual = porTaxa.get(taxa) ?? { taxa, base: 0, iva: 0 };
    atual.base += base;
    atual.iva += (base * taxa) / 100;
    porTaxa.set(taxa, atual);
  }

  return {
    porTaxa: [...porTaxa.values()].sort((a, b) => b.taxa - a.taxa),
    isento,
  };
}

/** Classes Tailwind para o badge de cada estado de fatura. */
export const ESTADO_BADGE: Record<string, string> = {
  rascunho: "bg-slate-100 text-slate-700",
  emitida: "bg-amber-100 text-amber-800",
  paga: "bg-emerald-100 text-emerald-800",
  anulada: "bg-red-100 text-red-700",
};

export const ESTADO_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  emitida: "Emitida",
  paga: "Paga",
  anulada: "Anulada",
};
