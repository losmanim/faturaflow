/**
 * Emissor fiscal — camada anti-corrupção entre a app e o serviço de NFS-e.
 *
 * A app só conhece a interface `EmissorNFS`. Cada implementação (mock, Focus,
 * SEFAZ direta...) traduz a nossa estrutura para o protocolo do fornecedor.
 * Trocar de emissor é uma decisão de configuração, não de código.
 */

export interface DadosServico {
  descricao: string;
  quantidade: number;
  valor: number;
  nbs: string | null;
  iss: number;
  simplesNacional: boolean;
}

export interface DadosEmissao {
  /** Identificação da empresa emissora (perfil). */
  empresa: {
    razaoSocial: string;
    cnpj: string;
    inscricaoMunicipal: string | null;
    regime: "MEI" | "Simples Nacional" | "Lucro Presumido" | "Lucro Real";
    municipio: string | null;
    codigoMunicipio: string | null;
    aliqIss: number;
    nbsDefault: string | null;
  };
  /** Tomador do serviço (cliente). */
  tomador: {
    nome: string;
    cpfCnpj: string | null;
    email: string | null;
  };
  /** RPS (Recibo Provisório de Serviços). */
  rps: { numero: number; serie: string; competencia: string };
  servicos: DadosServico[];
  valorTotal: number;
}

export interface ResultadoEmissao {
  autorizada: boolean;
  numeroNfse?: string;
  codigoVerificacao?: string;
  protocolo?: string;
  linkPdf?: string;
  xml?: string;
  /** Preenchido quando rejeitada (motivo do erro). */
  motivo?: string;
}

export interface EmissorNFS {
  readonly nome: string;
  emitir(dados: DadosEmissao): Promise<ResultadoEmissao>;
}

export type TipoEmissor = "mock" | "focus";

export function tipoEmissorValido(v: string | undefined): TipoEmissor {
  return v === "focus" ? "focus" : "mock";
}
