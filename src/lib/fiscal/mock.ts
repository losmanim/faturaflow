import type { EmissorNFS, DadosEmissao, ResultadoEmissao } from "./emissor";

/**
 * Emissor simulado — permite o fluxo completo da NFS-e (emitir, autorizar,
 * rejeitar, guardar XML) sem depender de credenciais reais nem da internet.
 * Útil para demo e testes; substituível por `focus` (ou outro) via env.
 */
export const emissorMock: EmissorNFS = {
  nome: "mock",

  async emitir(dados: DadosEmissao): Promise<ResultadoEmissao> {
    await new Promise((r) => setTimeout(r, 900)); // simula o tempo de resposta do município

    const erros: string[] = [];
    if (!dados.empresa.razaoSocial) erros.push("Razão social do emitente obrigatória.");
    if (!/^\d{14}$/.test(dados.empresa.cnpj || ""))
      erros.push("CNPJ do emitente deve ter 14 dígitos.");
    if (!/^\d{11}$/.test(dados.tomador.cpfCnpj || "") && !/^\d{14}$/.test(dados.tomador.cpfCnpj || ""))
      erros.push("CPF (11) ou CNPJ (14) do tomador é obrigatório.");
    if (!dados.empresa.codigoMunicipio)
      erros.push("Código do município (IBGE) do serviço é obrigatório.");

    const comServicoSemNbs = dados.servicos.some(
      (s) => !s.nbs || s.nbs.trim().length < 5
    );
    if (comServicoSemNbs)
      erros.push("Todas as linhas precisam do código de serviço (NBS).");

    if (erros.length > 0) {
      return {
        autorizada: false,
        motivo: erros.join(" "),
      };
    }

    const numero = String(1_000_000 + dados.rps.numero);
    return {
      autorizada: true,
      numeroNfse: numero,
      codigoVerificacao: `CV${dados.rps.numero}${dados.rps.serie}`.padEnd(9, "0"),
      protocolo: `NFSe-${dados.empresa.codigoMunicipio}-${numero}`,
      linkPdf: `https://emissor.exemplo.br/nfse/${numero}.pdf`,
      xml: gerarXml(dados, numero),
    };
  },
};

/** Gera uma representação simplificada do XML da NFS-e para demonstração. */
function gerarXml(dados: DadosEmissao, numeroNfse: string): string {
  const linhas = dados.servicos
    .map(
      (s, i) =>
        `    <ItemNotaInformacao>\n      <Descricao>${escapeXml(s.descricao)}</Descricao>\n      <ValorServico>${s.valor.toFixed(2)}</ValorServico>\n      <CodigoServico>${escapeXml(s.nbs ?? "")}</CodigoServico>\n      <AliquotaIss>${s.iss.toFixed(2)}</AliquotaIss>\n    </ItemNotaInformacao>`
    )
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<NotaFiscalServico>\n  <InfNfse>\n    <Numero>${numeroNfse}</Numero>\n` +
    `    <Competencia>${dados.rps.competencia}</Competencia>\n` +
    `    <Rps><Numero>${dados.rps.numero}</Numero><Serie>${escapeXml(dados.rps.serie)}</Serie></Rps>\n` +
    `    <Emitente><RazaoSocial>${escapeXml(dados.empresa.razaoSocial)}</RazaoSocial><Cnpj>${dados.empresa.cnpj}</Cnpj><Municipio>${escapeXml(dados.empresa.codigoMunicipio ?? "")}</Municipio></Emitente>\n` +
    `    <Tomador><RazaoSocial>${escapeXml(dados.tomador.nome)}</RazaoSocial><CpfCnpj>${dados.tomador.cpfCnpj ?? ""}</CpfCnpj></Tomador>\n` +
    `    <ItensNota>\n${linhas}\n    </ItensNota>\n  </InfNfse>\n</NotaFiscalServico>`
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
