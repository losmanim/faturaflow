import type { EmissorNFS, DadosEmissao, ResultadoEmissao } from "./emissor";

/**
 * Emissor real via API da Focus NFe (emissão de NFS-e para milhares de
 * municípios). Requer o token em `FOCUS_NFSE_TOKEN` e ambiente homologação
 * ou produção. Se o token não estiver configurado, devolve uma rejeição
 * explicativa — a app nunca parte sozinha.
 *
 * Docs: https://doc.focusnfe.com.br/reference/emitir_nfse
 */
export const emissorFocus: EmissorNFS = {
  nome: "focus",

  async emitir(dados: DadosEmissao): Promise<ResultadoEmissao> {
    const token = process.env.FOCUS_NFSE_TOKEN;
    if (!token) {
      return {
        autorizada: false,
        motivo:
          "Emissor Focus não configurado. Define a variável de ambiente FOCUS_NFSE_TOKEN.",
      };
    }

    const url =
      process.env.FOCUS_AMBIENTE === "producao"
        ? "https://api.focusnfe.com.br/v2/nfse"
        : "https://homologacao.focusnfe.com.br/v2/nfse";

    const payload = {
      natureza_operacao: "0",
      rps: { numero: dados.rps.numero, serie: dados.rps.serie },
      competencia: dados.rps.competencia,
      prestador: {
        cnpj: dados.empresa.cnpj,
        inscricao_municipal: dados.empresa.inscricaoMunicipal,
        codigo_municipio: dados.empresa.codigoMunicipio,
        valor_iss: dados.empresa.aliqIss,
      },
      tomador: {
        cpf_cnpj: dados.tomador.cpfCnpj,
        razao_social: dados.tomador.nome,
        email: dados.tomador.email,
      },
      servico: {
        descricao: dados.servicos.map((s) => s.descricao).join("; "),
        valor: dados.valorTotal.toFixed(2),
        codigo_tributacao_municipio: dados.empresa.nbsDefault ?? undefined,
      },
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          authorization: token,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const corpo = await res.json();

      if (!res.ok || !corpo.numero) {
        return {
          autorizada: false,
          motivo: (corpo.erros || [{ erro: "Erro desconhecido da Focus" }])
            .map((e: { erro: string }) => e.erro)
            .join(" "),
        };
      }

      return {
        autorizada: true,
        numeroNfse: corpo.numero,
        codigoVerificacao: corpo.codigo_verificacao,
        protocolo: corpo.protocolo,
        linkPdf: corpo.link_pdf,
        xml: corpo.xml || null,
      };
    } catch (erro) {
      return {
        autorizada: false,
        motivo: `Falha de comunicação com o emissor: ${(erro as Error).message}`,
      };
    }
  },
};
