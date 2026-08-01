"use client";

import { useActionState } from "react";
import { emitirNota, cancelarNota, type NotaState } from "@/app/(app)/faturas/actions";
import type { StatusNota } from "@/lib/types";

const btn =
  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50";

export function NotaActions({ id, status }: { id: string; status: StatusNota }) {
  const [emissao, emitirAction, emitindo] = useActionState<NotaState, FormData>(
    emitirNota.bind(null, id),
    null
  );
  const [cancelamento, cancelarAction, cancelando] = useActionState<
    NotaState,
    FormData
  >(cancelarNota.bind(null, id), null);

  const mensagem = emissao ?? cancelamento;

  return (
    <div>
      {mensagem && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            mensagem.ok
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {mensagem.mensagem}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(status === "nao_emitida" || status === "rejeitada") && (
          <form action={emitirAction}>
            <button
              type="submit"
              disabled={emitindo}
              className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}
            >
              <i className="bi bi-send"></i>
              {emitindo ? "A enviar..." : "Emitir NFS-e"}
            </button>
          </form>
        )}
        {status === "autorizada" && (
          <form action={cancelarAction}>
            <button
              type="submit"
              disabled={cancelando}
              className={`${btn} border border-red-300 text-red-600 hover:bg-red-50`}
            >
              <i className="bi bi-x-circle"></i>
              {cancelando ? "A cancelar..." : "Cancelar nota"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
