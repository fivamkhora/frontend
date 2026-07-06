import Link from "next/link";
import { Eye, IdCard, Info, Lock, Save, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

export default function NovoUsuarioPage() {
  return (
    <AppLayout active="secretaria">
      <section className="p-8">
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
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Cargo / Papel
                  </label>
                  <select className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white">
                    <option>Selecione um cargo</option>
                    <option>Aluno</option>
                    <option>Professor</option>
                    <option>Secretaria</option>
                    <option>Admin</option>
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
                      type="password"
                      placeholder="********"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-10 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                    />

                    <Eye
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-[#003b5c] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="h-40 bg-gradient-to-br from-[#003b5c] to-[#1e90ff]" />

              <div className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#003b5c]" />
                  <h3 className="font-bold text-slate-900">Khora Admin</h3>
                </div>

                <p className="text-sm text-slate-500">
                  Gestao segura de identidade e acesso para usuarios do
                  ambiente escolar.
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

              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#003b5c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#062f46]">
                <Save size={16} />
                Salvar Usuario
              </button>
            </div>
          </aside>
        </div>
      </section>
    </AppLayout>
  );
}
