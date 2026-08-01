export type EstadoFatura = "rascunho" | "emitida" | "paga" | "anulada";

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  nif: string | null;
  email: string | null;
  telefone: string | null;
  morada: string | null;
  created_at: string;
}

export interface Produto {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  iva: number;
  created_at: string;
}

export interface Fatura {
  id: string;
  user_id: string;
  cliente_id: string;
  numero: string;
  data_emissao: string;
  data_vencimento: string | null;
  forma_pagamento: string | null;
  estado: EstadoFatura;
  notas: string | null;
  created_at: string;
}

export interface FaturaLinha {
  id: string;
  fatura_id: string;
  produto_id: string | null;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  iva: number;
  isencao: string | null;
}

/** Dados do fornecedor (configurados em Definições) — aparecem nas faturas. */
export interface Perfil {
  user_id: string;
  nome: string | null;
  nif: string | null;
  morada: string | null;
  email: string | null;
  telefone: string | null;
  updated_at: string;
}

/** Fatura com joins do Supabase (cliente + linhas) */
export interface FaturaCompleta extends Fatura {
  clientes: Pick<Cliente, "id" | "nome" | "nif" | "email" | "morada"> | null;
  fatura_linhas: FaturaLinha[];
}
