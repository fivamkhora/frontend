"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockLogin } from "@/services/auth";
import Link from "next/link";
import type { SyntheticEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      // Simula salvar o token e redirecionar o usuário
      localStorage.setItem("khora_token", (data as any).access_token);
      
      // Redirecionar para a página de dashboard ou home
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.detail || "Ocorreu um erro durante o login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md border border-gray-100">
            <h1 className="text-3xl font-bold mb-2 text-center text-slate-800">Bem-vindo ao Khora</h1>
            <p className="text-center text-gray-500 mb-6">Faça login para acessar sua conta</p>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    placeholder="Digite seu email"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                    type="password"
                    placeholder="Digite sua senha (min 6 caracteres)"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium p-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                disabled={loading}
            >
                {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500 mt-4">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-blue-600 hover:underline">
                    Cadastre-se aqui
                </Link>
            </p>
        </form>
    </div>
  );
}