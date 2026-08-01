import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegistarPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-slate-800">
        Criar sua conta
      </h1>
      <AuthForm mode="registar" />
      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </>
  );
}
