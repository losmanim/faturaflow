export type EstadoFatura = "rascunho" | "emitida" | "paga" | "anulada";

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  nif: string | null;
  cpf_cnpj: string | null;
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

export type StatusNota =
  | "nao_emitida"
  | "processando"
  | "autorizada"
  | "rejeitada"
  | "cancelada";

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
  // Campos NFS-e (FaturaFlow-BR)
  competencia: string | null;
  status_nota: StatusNota;
  rps_numero: number | null;
  rps_serie: string | null;
  numero_nfse: string | null;
  codigo_verificacao: string | null;
  protocolo: string | null;
  link_pdf: string | null;
  xml_nota: string | null;
  motivo_rejeicao: string | null;
  data_autorizacao: string | null;
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
  // Campos NFS-e (FaturaFlow-BR)
  nbs: string | null;
  iss: number;
  simples_nacional: boolean;
}

export type RegimeTributario = "MEI" | "Simples Nacional" | "Lucro Presumido" | "Lucro Real";

/** Dados da empresa emissora (Definições) — aparecem nas NFS-e. */
export interface Perfil {
  user_id: string;
  nome: string | null;
  nif: string | null;
  morada: string | null;
  email: string | null;
  telefone: string | null;
  updated_at: string;
  // Dados fiscais brasileiros
  cnpj: string | null;
  razao_social: string | null;
  inscricao_municipal: string | null;
  regime_tributario: RegimeTributario;
  municipio: string | null;
  codigo_municipio: string | null;
  aliq_iss: number;
  nbs_default: string | null;
}

/** Fatura com joins do Supabase (cliente + linhas) */
export interface FaturaCompleta extends Fatura {
  clientes: Pick<Cliente, "id" | "nome" | "nif" | "cpf_cnpj" | "email" | "morada"> | null;
  fatura_linhas: FaturaLinha[];
}
