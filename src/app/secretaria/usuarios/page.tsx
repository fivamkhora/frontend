import Link from "next/link";
import { Edit3, Plus, Search, ShieldCheck, UserRound } from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

const users = [
  {
    id: "1",
    email: "joao.professor@example.com",
    name: "Joao Professor Exemplo",
    role: "Professor",
    status: "Ativo",
    username: "joao.professor",
  },
  {
    id: "2",
    email: "maria.secretaria@example.com",
    name: "Maria Secretaria",
    role: "Secretaria",
    status: "Ativo",
    username: "maria.secretaria",
  },
  {
    id: "3",
    email: "coord.pedagogico@example.com",
    name: "Coordenacao Pedagogica",
    role: "Coordenador",
    status: "Pendente",
    username: "coord.pedagogico",
  },
];

export default function SecretariaUsuariosPage() {
  return (
    <AppLayout active="secretaria">
      <section className="px-8 py-6">
        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Secretaria</span>
              <span>&gt;</span>
              <span className="text-[#1e3a8a]">Usuarios</span>
            </div>
            <h1 className="text-3xl font-bold text-[#0f3b63]">Usuarios</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie os acessos de professores, secretaria e coordenacao.
            </p>
          </div>

          <Link
            href="/secretaria/usuarios/novo"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0a2540] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123a60]"
          >
            <Plus size={18} />
            Novo usuario
          </Link>
        </header>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="relative block max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar por nome, usuario ou e-mail"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white"
            />
          </label>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_120px_120px] gap-4 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
            <span>Nome</span>
            <span>Usuario</span>
            <span>Perfil</span>
            <span>Status</span>
            <span>Acoes</span>
          </div>

          <div className="divide-y divide-slate-100">
            {users.map((user) => (
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
                      {user.name}
                    </h2>
                    <p className="truncate text-slate-500">{user.email}</p>
                  </div>
                </div>

                <span className="text-slate-600">{user.username}</span>

                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck size={16} className="text-[#1e3a8a]" />
                  <span>{user.role}</span>
                </div>

                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {user.status}
                </span>

                <Link
                  href={`/secretaria/usuarios/${user.id}`}
                  className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-[#1e3a8a] transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <Edit3 size={15} />
                  Editar
                </Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppLayout>
  );
}
