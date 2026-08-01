/** Formata um número como moeda EUR (pt-PT). */
export function formatEUR(valor: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(valor);
}

/** Formata um número como moeda BRL (pt-BR). */
export function formatBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/** Formata CPF (11) ou CNPJ (14) no padrão brasileiro. */
export function formatDocumento(doc: string | null | undefined): string {
  const d = (doc ?? "").replace(/\D/g, "");
  if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  if (d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  return doc ?? "";
}

/** Formata uma data ISO (ou 'YYYY-MM-DD') para pt-PT. */
export function formatDate(iso: string): string {
  const normalizada = iso.length === 10 ? `${iso}T00:00:00` : iso;
  return new Date(normalizada).toLocaleDateString("pt-PT");
}

/**
 * Calcula subtotal, ISS e total de uma lista de linhas de NFS-e.
 * Para Simples Nacional o ISS não compõe o valor (recolhido via DAS),
 * por isso as linhas vêm com `iss = 0` — o total fica igual ao subtotal.
 */
export function calcTotais(
  linhas: { quantidade: number; preco_unitario: number; iss?: number }[]
) {
  const subtotal = linhas.reduce((s, l) => s + l.quantidade * l.preco_unitario, 0);
  const issTotal = linhas.reduce(
    (s, l) => s + l.quantidade * l.preco_unitario * ((l.iss ?? 0) / 100),
    0
  );
  return { subtotal, issTotal, total: subtotal + issTotal };
}

/**
 * Resumo de ISS agrupado por alíquota (para a NFS-e).
 */
export function resumoISS(
  linhas: { quantidade: number; preco_unitario: number; iss?: number }[]
) {
  const porAliquota = new Map<number, { aliquota: number; base: number; iss: number }>();
  for (const l of linhas) {
    const base = l.quantidade * l.preco_unitario;
    const aliquota = Number(l.iss ?? 0);
    const atual = porAliquota.get(aliquota) ?? { aliquota, base: 0, iss: 0 };
    atual.base += base;
    atual.iss += (base * aliquota) / 100;
    porAliquota.set(aliquota, atual);
  }
  return [...porAliquota.values()].sort((a, b) => b.aliquota - a.aliquota);
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

/** Classes Tailwind para o badge do status da NFS-e. */
export const NOTA_BADGE: Record<string, string> = {
  nao_emitida: "bg-slate-100 text-slate-600",
  processando: "bg-sky-100 text-sky-700",
  autorizada: "bg-emerald-100 text-emerald-700",
  rejeitada: "bg-red-100 text-red-700",
  cancelada: "bg-zinc-200 text-zinc-600",
};

export const NOTA_LABEL: Record<string, string> = {
  nao_emitida: "Não emitida",
  processando: "Processando",
  autorizada: "Autorizada",
  rejeitada: "Rejeitada",
  cancelada: "Cancelada",
};
