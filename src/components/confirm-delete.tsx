"use client";

/** Botão de eliminar com confirmação nativa (usado com server actions). */
export function ConfirmDelete({
  action,
  label = "Eliminar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Eliminar definitivamente? Esta ação não pode ser anulada.")) {
          e.preventDefault();
        }
      }}
      className="inline"
    >
      <button type="submit" className="text-sm text-red-600 hover:underline">
        {label}
      </button>
    </form>
  );
}
