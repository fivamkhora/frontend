"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TemporaryDashboardPage() {
    const router = useRouter();

    const handleLogout = () => {
        // LImpa o token do localStorage para simular o logout real
        localStorage.removeItem("khora_token");
        //Retorna para a tela de login
        router.push('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#0f172a] items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl bg-white text-center border-gray-100">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-full">
                        <LayoutDashboard size={40} />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Khora</h1>
                <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-3 py-1 rounded-full mb-6">
                    Espaço Reservado / Em construção
                </span>

                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    O Login simulado foi um sucesso e o token de acesso foi armazenado no navegador! Esta área será totalmente integrada
                    com as funcionalidade de turmas e relatórios na próxima etapa.
                </p>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-[#0a2540] text-white font-medium p-3 rounded-lg hover:bg-opacity-95 transition-all shadow-md"
                >
                    <LogOut size={16} />
                    <span>Sair e Voltar para o Login</span>
                </button>
            </div>
        </div>
    );
}