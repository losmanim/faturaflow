import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-slate-800">
        Entrar na tua conta
      </h1>
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-sm text-slate-500">
        Ainda não tens conta?{" "}
        <Link
          href="/registar"
          className="font-medium text-indigo-600 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </>
  );
}
