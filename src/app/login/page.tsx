"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockLogin } from "@/services/auth";
import Link from "next/link";
import type { SyntheticEvent } from "react";
import {
  Brain,
  Eye,
  EyeOff, // Adicionado aqui
  FileText,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Novo estado criado aqui
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await mockLogin(email, password);
      console.log("Login bem-sucedido:", data);

      localStorage.setItem("khora_token", data.access_token);

      router.push("/dashboard");
    } catch (err) {
      const apiError = err as { detail?: string };
      setError(apiError.detail || "Ocorreu um erro durante o login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] items-center justify-center p-4 md:p-10 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl min-h-[80vh]">
        <div className="w-full md:w-1/2 bg-[#1e3a8a] text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
          <div className="max-w-md z-10">
            <span className="inline-block bg-[#8b5cf6] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
              <span className="flex items-center gap-3">
                <Brain /> Excelência com IA
              </span>
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Domine qualquer assunto com a Khora.
            </h2>
            <p className="text-blue-200 text-base md:text-lg leading-relaxed">
              Junte-se a milhares de professores que usam nosso copiloto
              inteligente para gerar questionários personalizados e aplicar
              avaliações com facilidade.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between bg-[#f8fafc]">
          <div className="w-full max-w-md mx-auto my-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2 tracking-tight">
                Khora
              </h1>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Bem-vindo de volta
              </h3>
              <p className="text-sm text-gray-500">
                Faça login para acessar sua conta e continuar sua jornada.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  placeholder="joao@exemplo.com"
                  className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Senha
                  </label>
                  <Link
                    href="/recuperar-senha"
                    className="text-xs text-[#1e3a8a] hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400 text-sm"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div
                    className="absolute right-3 top-3.5 text-gray-400 cursor-pointer hover:text-gray-600 select-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}{" "}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0a2540] text-white font-medium p-3 rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 mt-6 shadow-md disabled:bg-gray-400"
                disabled={loading}
              >
                <span>
                  {loading ? (
                    <span className="flex gap-3 items-center">
                      {" "}
                      <LoaderCircle className="animate-spin" /> Entrando...
                    </span>
                  ) : (
                    "Entrar na Conta"
                  )}
                </span>
                {!loading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link
                href="/cadastro"
                className="text-[#1e3a8a] font-semibold hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <div className="flex justify-center gap-6 text-gray-400 mb-3">
              <ShieldCheck />
              <Lock />
              <FileText />
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              © 2026 KHORA AI EDUCAÇÃO. TODOS OS DIREITOS RESERVADOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
