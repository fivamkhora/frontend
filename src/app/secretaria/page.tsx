import Link from "next/link";
import {
  BarChart3,
  UserPlus,
  Users,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { getAuthSession } from "@/lib/auth/server";
import { BFF_BASE_URL } from "@/lib/bff";

export const dynamic = "force-dynamic";

type SecretariaUser = {
  birth?: string;
  cpf?: string;
  email?: string;
  id: number;
  name?: string;
  role?: string;
  user_id?: number;
  username?: string;
};

const secretariaCards = [
  {
    description: "Consultar, cadastrar e editar acessos dos usuarios.",
    href: "/secretaria/usuarios",
    icon: Users,
    title: "Usuarios",
  },
  {
    description: "Consultar turmas e gerenciar vinculos academicos.",
    href: "/secretaria/classes",
    icon: UserPlus,
    title: "Classes",
  },
];

async function getSecretariaUsers(): Promise<{
  error: string;
  users: SecretariaUser[];
}> {
  try {
    const session = await getAuthSession();
    const response = await fetch(`${BFF_BASE_URL}/api/v1/auth/user`, {
      headers: {
        Accept: "application/json",
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        error: `BFF respondeu ${response.status} ao buscar usuarios.`,
        users: [],
      };
    }

    const data = (await response.json()) as unknown;

    if (!Array.isArray(data)) {
      return {
        error: "Resposta invalida ao buscar usuarios.",
        users: [],
      };
    }

    return {
      error: "",
      users: data as SecretariaUser[],
    };
  } catch {
    return {
      error: "Nao foi possivel carregar usuarios do BFF.",
      users: [],
    };
  }
}

function getRoleCount(users: SecretariaUser[], role: string) {
  return users.filter(
    (user) => user.role?.toLowerCase() === role.toLowerCase(),
  ).length;
}

function getUniqueRoleCount(users: SecretariaUser[]) {
  return new Set(users.map((user) => user.role).filter(Boolean)).size;
}

function formatBirthDate(value?: string) {
  if (!value) {
    return "Nascimento nao informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Nascimento nao informado";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function SecretariaPage() {
  const { error, users } = await getSecretariaUsers();
  const recentUsers = users.slice(0, 5);
  const totalUsers = users.length;
  const totalRoles = getUniqueRoleCount(users);
  const totalStudents = getRoleCount(users, "Aluno");

  return (
    <AppLayout active="secretaria">
      <section className="px-8 py-6">
        <header className="mb-8 flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#003b5c] text-white">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#003b5c]">
                Secretaria
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Administracao escolar e gestao de usuarios.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar usuario ou turma..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white sm:w-80"
              />
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-700">
                Secretaria Geral
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#003b5c] text-sm font-bold text-white">
                SG
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
                <Users size={22} />
              </div>
              <div>
                <small className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Usuarios
                </small>
                <strong className="block text-2xl text-slate-950">
                  {totalUsers}
                </strong>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <ShieldCheck size={22} />
              </div>
              <div>
                <small className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Perfis cadastrados
                </small>
                <strong className="block text-2xl text-slate-950">
                  {totalRoles}
                </strong>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <BarChart3 size={22} />
              </div>
              <div>
                <small className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Alunos
                </small>
                <strong className="block text-2xl text-slate-950">
                  {totalStudents}
                </strong>
              </div>
            </div>
          </article>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          {secretariaCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
                  <Icon size={22} />
                </div>

                <h2 className="text-base font-semibold text-slate-900">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Usuarios cadastrados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Dados carregados do BFF.
            </p>
          </div>

          {recentUsers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <article
                  key={user.id}
                  className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">
                      {user.name || "Nome nao informado"}
                    </h3>
                    <p className="truncate text-slate-500">
                      {user.email || "E-mail nao informado"}
                    </p>
                  </div>

                  <span className="text-slate-600">
                    {user.username || "Usuario nao informado"}
                  </span>

                  <span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1e3a8a]">
                    {user.role || "Perfil nao informado"}
                  </span>

                  <span className="text-slate-500">
                    {formatBirthDate(user.birth)}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhum usuario retornado pelo BFF.
            </div>
          )}
        </section>
      </section>
    </AppLayout>
  );
}
