"use client";

import Link from "next/link";
import { Save } from "lucide-react";

type UserFormProps = {
  mode: "create" | "edit";
  user?: {
    email: string;
    name: string;
    role: string;
    username: string;
  };
};

export function UserForm({ mode, user }: UserFormProps) {
  const isEditing = mode === "edit";

  return (
    <form className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Nome
          </span>
          <input
            type="text"
            defaultValue={user?.name}
            placeholder="Nome completo"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Usuario
          </span>
          <input
            type="text"
            defaultValue={user?.username}
            placeholder="usuario.sistema"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            E-mail
          </span>
          <input
            type="email"
            defaultValue={user?.email}
            placeholder="usuario@escola.com"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Perfil
          </span>
          <select
            defaultValue={user?.role || "Professor"}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
          >
            <option>Professor</option>
            <option>Secretaria</option>
            <option>Coordenador</option>
            <option>Administrador</option>
          </select>
        </label>
      </div>

      {!isEditing && (
        <label className="mt-5 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Senha inicial
          </span>
          <input
            type="password"
            placeholder="Senha temporaria"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100 md:w-1/2"
          />
        </label>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/secretaria/usuarios"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#1e3a8a]"
        >
          Cancelar
        </Link>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0a2540] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123a60]"
        >
          <Save size={17} />
          {isEditing ? "Salvar alteracoes" : "Cadastrar usuario"}
        </button>
      </div>
    </form>
  );
}
