import Link from "next/link";
import {
  Download,
  Edit,
  Filter,
  Plus,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

const users = [
  {
    email: "r.oliveira@khora.edu",
    id: 1,
    name: "Dr. Ricardo Oliveira",
    register: "PROF-4452",
    role: "Professor",
    status: "Ativo",
  },
  {
    email: "ana.santos@email.com",
    id: 2,
    name: "Ana Luiza Santos",
    register: "ALUN-1209",
    role: "Aluno",
    status: "Ativo",
  },
  {
    email: "marcos.viana@khora.com",
    id: 3,
    name: "Marcos Vieira",
    register: "SECR-0032",
    role: "Secretaria",
    status: "Inativo",
  },
  {
    email: "fernanda.silva@khora.edu",
    id: 4,
    name: "Fernanda Silva",
    register: "PROF-3291",
    role: "Professor",
    status: "Ativo",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((item) => item[0])
    .join("");
}

export default function GestaoUsuariosPage() {
  return (
    <AppLayout active="secretaria">
      <section className="p-8">
        <div className="mb-2 text-xs font-medium text-slate-400">
          Admin &gt; Gestao de Usuarios
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003b5c]">
              Gestao de Usuarios
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Administre e monitore todos os acessos do portal educacional.
            </p>
          </div>

          <Link
            href="/secretaria/usuarios/novo"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#003b5c] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#062f46]"
          >
            <Plus size={16} />
            Adicionar Novo Usuario
          </Link>
        </div>

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-4 border-b border-slate-100 pb-3">
            <button className="text-sm font-semibold text-[#003b5c]">
              Todos
            </button>
            <button className="text-sm font-medium text-slate-500">
              Alunos
            </button>
            <button className="text-sm font-medium text-slate-500">
              Professores
            </button>
            <button className="text-sm font-medium text-slate-500">
              Secretaria
            </button>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none">
                <option>Todos os Status</option>
                <option>Ativo</option>
                <option>Inativo</option>
              </select>

              <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none">
                <option>Todos Departamentos</option>
                <option>Professores</option>
                <option>Alunos</option>
                <option>Secretaria</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Filter size={15} />
                Filtros Avancados
              </button>

              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Download size={15} />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Cargo/Papel</th>
                <th className="px-5 py-3">Matricula/ID</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Acoes</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        {getInitials(user.name)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-[#1e3a8a]">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {user.register}
                  </td>

                  <td className="px-5 py-4 text-slate-600">{user.email}</td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        user.status === "Ativo"
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/secretaria/usuarios/${user.id}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#003b5c]"
                        aria-label={`Editar ${user.name}`}
                      >
                        <Edit size={15} />
                      </Link>

                      <button className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
            <span>Mostrando 1-4 de 1.240 usuarios</span>

            <div className="flex gap-2">
              <button className="rounded-md border border-slate-200 px-3 py-1 hover:bg-slate-50">
                1
              </button>
              <button className="rounded-md border border-slate-200 px-3 py-1 hover:bg-slate-50">
                2
              </button>
              <button className="rounded-md border border-slate-200 px-3 py-1 hover:bg-slate-50">
                3
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="mb-3 text-[#003b5c]" size={24} />
            <p className="text-xs font-semibold uppercase text-slate-500">
              Total de usuarios
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">1.240</h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserCheck className="mb-3 text-green-600" size={24} />
            <p className="text-xs font-semibold uppercase text-slate-500">
              Usuarios ativos
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">1.182</h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserX className="mb-3 text-red-500" size={24} />
            <p className="text-xs font-semibold uppercase text-slate-500">
              Usuarios inativos
            </p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">58</h3>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
