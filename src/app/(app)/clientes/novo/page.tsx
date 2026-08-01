import { ClienteForm } from "@/components/cliente-form";

export default function NovoClientePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Novo cliente</h1>
      <ClienteForm />
    </div>
  );
}
