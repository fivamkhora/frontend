"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockRegister } from "@/services/auth";
import Link from "next/link";
import type { SyntheticEvent } from "react";

export default function CadastroPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("aluno");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const data = await mockRegister(name, email, password, role);
            console.log("Cadastro bem-sucedido:", data);

            // Redirecionar para a página de login após cadastro
            alert("Cadastro realizado com sucesso! Faça login para acessar sua conta.");
            router.push("/login");
        } catch (err: any) {
            setError(err.detail || "Ocorreu um erro durante o cadastro.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-10">
            <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-md border border-gray-100">
                <h1 className="text-3xl font-bold mb-2 text-center text-slate-800">Crie sua conta no Khora</h1>
                <p className="text-center text-gray-500 mb-6">Junte-se ao Khora e comece sua jornada</p>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                        type="text"
                        placeholder="Digite seu nome completo"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                        type="password"
                        placeholder="Digite uma senha (min 6 caracteres)"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuário</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="teacher">Professor</option>
                        <option value="student">Aluno(a)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-medium p-2.5 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    disabled={isLoading}
                >
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                </button>

                <p className="mt-6 text-center text-sm text-gray-500 mt-4">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Faça login aqui
                    </Link>
                </p>
            </form>
        </div>
    );
}