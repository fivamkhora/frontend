"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FilePlus2, Files } from "lucide-react";
import { AppLayout } from "@/app/_components/AppLayout";
import { getCurrentDateLabel } from "@/services/date";
import {
  fetchAuthenticatedUser,
  type AuthenticatedUser,
} from "@/services/authService";

export default function TemporaryDashboardPage() {
  const currentDateLabel = getCurrentDateLabel();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const authenticatedUser = await fetchAuthenticatedUser();

        if (active) {
          setUser(authenticatedUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppLayout active="home" user={user}>
      <section className="p-8">
        <div className="border-l-2 border-[#1e3a8a] pl-5">
          <h1 className="text-2xl font-bold text-slate-900">
            Ola, {user?.name || "Professor"}!
          </h1>

          <p className="mt-1 text-sm text-slate-500">{currentDateLabel}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/confeccao"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
              <FilePlus2 size={22} />
            </div>

            <h2 className="text-base font-semibold text-slate-900">
              Confeccionar prova
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Criar uma nova avaliacao escolar com apoio da plataforma.
            </p>
          </Link>

          <Link
            href="/provas"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#1e3a8a]">
              <Files size={22} />
            </div>

            <h2 className="text-base font-semibold text-slate-900">
              Lista de provas
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Visualizar, revisar e acompanhar provas ja criadas.
            </p>
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
