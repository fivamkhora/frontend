import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";

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

export default function SecretariaPage() {
  return (
    <AppLayout active="secretaria">
      <section className="px-8 py-6">
        <header className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
        </header>

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
      </section>
    </AppLayout>
  );
}
