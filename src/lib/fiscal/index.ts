import type { EmissorNFS } from "./emissor";
import { emissorMock } from "./mock";
import { emissorFocus } from "./focus";

export { emissorMock, emissorFocus };
export type { EmissorNFS, DadosEmissao, ResultadoEmissao } from "./emissor";

/**
 * Devolve o emissor configurado. Por omissão usa o simulador (`mock`) —
 * o fluxo funciona em demo sem qualquer credencial. Para emitir notas reais,
 * define `EMISSOR_NFSE=focus` (e `FOCUS_NFSE_TOKEN`).
 */
export function getEmissor(): EmissorNFS {
  const tipo = process.env.EMISSOR_NFSE === "focus" ? "focus" : "mock";
  return tipo === "focus" ? emissorFocus : emissorMock;
}
