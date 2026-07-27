"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { toast } from "sonner";

type UserItem = {
  id: string | number;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
  status?: string;
};

export default function SecretariaUsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/secretaria/usuarios", {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error("Não foi possível carregar a lista de usuários.");
        }

        const data = await res.json();

        if (active) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error
              ? err.message
              : "Erro ao buscar usuários do sistema.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  // Filtro de Busca por Nome, Username, Email ou Cargo
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      const role = (u.role || "").toLowerCase();

      return (
        name.includes(term) ||
        email.includes(term) ||
        username.includes(term) ||
        role.includes(term)
      );
    });
  }, [users, search]);

  return (
    <AppLayout active="secretaria">
      <section className="px-8 py-6">
        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Secretaria</span>
              <span>&gt;</span>
              <span className="text-[#1e3a8a]">Usuários</span>
            </div>
            <h1 className="text-3xl font-bold text-[#0f3b63]">Usuários</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie os acessos de professores, secretaria, alunos e
              coordenação.
            </p>
          </div>

          <Link
            href="/secretaria/usuarios/novo"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0a2540] px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#123a60]"
          >
            <Plus size={18} />
            Novo usuário
          </Link>
        </header>

        {/* BARRA DE PESQUISA */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <label className="relative block max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, usuário, e-mail ou cargo..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white"
            />
          </label>
        </div>

        {/* MENSAGEM DE ERRO */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* LISTAGEM / TABELA */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500">
            <LoaderCircle size={22} className="animate-spin text-[#1e3a8a]" />
            <span className="text-sm font-medium">Carregando usuários...</span>
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="hidden grid-cols-[1.2fr_1fr_1fr_120px_120px] gap-4 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
              <span>Nome</span>
              <span>Usuário</span>
              <span>Perfil</span>
              <span>Status</span>
              <span>Ações</span>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const name = user.name || "Usuário";
                  const email = user.email || "E-mail não informado";
                  const username = user.username || `ID: ${user.id}`;
                  const role = user.role || "Aluno";
                  const status = user.status || "Ativo";

                  return (
                    <article
                      key={user.id}
                      className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.2fr_1fr_1fr_120px_120px] md:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a]">
                          <UserRound size={18} />
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate font-bold text-slate-900">
                            {name}
                          </h2>
                          <p className="truncate text-xs text-slate-500">
                            {email}
                          </p>
                        </div>
                      </div>

                      <span className="text-slate-600 font-medium">
                        {username}
                      </span>

                      <div className="flex items-center gap-2 text-slate-700">
                        <ShieldCheck size={16} className="text-[#1e3a8a]" />
                        <span>{role}</span>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {status}
                      </span>

                      <Link
                        href={`/secretaria/usuarios/${user.id}`}
                        className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-[#1e3a8a] transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <Edit3 size={15} />
                        Editar
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-sm font-medium text-slate-500">
                Nenhum usuário encontrado com os filtros aplicados.
              </div>
            )}
          </section>
        )}
      </section>
    </AppLayout>
  );
}
