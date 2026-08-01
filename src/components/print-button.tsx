"use client";

/** Botão de impressão — o utilizador pode guardar como PDF no diálogo do browser. */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
    >
      <i className="bi bi-printer mr-1"></i> Imprimir / PDF
    </button>
  );
}
