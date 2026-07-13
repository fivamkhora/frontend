"use client";

import Link from "next/link";
import {
  Eye,
  EyeOff,
  IdCard,
  Info,
  Lock,
  Save,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { useState } from "react";
import { createUser } from "@/services/authService";

type UserRole = "Aluno" | "Professor" | "Admin" | "Secretaria";

export default function NovoUsuarioPage() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [cargo, setCargo] = useState<UserRole>("Aluno");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !cpf || !email || !dataNasc || !username || !senha) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      setIsLoading(true);
      await createUser({
        name,
        cpf,
        email,
        birth: dataNasc,
        role: cargo,
        username,
        password: senha,
      });

      alert("Usuário criado com sucesso!");

      setName("");
      setCpf("");
      setEmail("");
      setDataNasc("");
      setCargo("Aluno");
      setUsername("");
      setSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao salvar o usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout active="secretaria">
      <form onSubmit={handleSave} className="p-8">
        <div className="mb-2 text-xs font-medium text-slate-400">
          Usuarios &gt; Adicionar Novo
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#003b5c]">
            Adicionar Novo Usuario
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha os campos abaixo para criar um novo registro no sistema
            Khora.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#003b5c]">
                  <IdCard size={18} />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Dados Pessoais
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Maria Oliveira Santos"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={dataNasc}
                    onChange={(e) => setDataNasc(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Cargo / Papel
                  </label>
                  <select
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value as UserRole)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  >
                    <option value="Aluno">Aluno</option>
                    <option value="Professor">Professor</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex gap-3">
                <Info className="mt-0.5 text-green-700" size={18} />

                <div>
                  <h3 className="text-sm font-bold text-green-800">
                    Importante
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    As informacoes de cargo determinam quais permissoes e
                    modulos o usuario podera acessar apos o login inicial.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#003b5c]">
                  <Lock size={18} />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Dados de Acesso
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Nome de Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="maria.oliveira"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maria@example.com"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Senha
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="********"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-10 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="********"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="h-40 bg-linear-to-br from-[#003b5c] to-[#1e90ff]" />

              <div className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#003b5c]" />
                  <h3 className="font-bold text-slate-900">Khora Admin</h3>
                </div>

                <p className="text-sm text-slate-500">
                  Gestao segura de identidade e acesso para usuarios do ambiente
                  escolar.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/secretaria/usuarios"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#003b5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#062f46] disabled:bg-slate-400"
              >
                <Save size={16} />
                {isLoading ? "Salvando..." : "Salvar Usuario"}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </AppLayout>
  );
}
