"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brain, FilePlus2, Files, Sparkles } from "lucide-react";
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
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="z-10 flex-1 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Bem-vindo de volta, {user?.name || "Professor"}.
            </h1>
            <p className="mt-2 text-sm text-blue-100 md:text-base leading-relaxed">
              Sua jornada de ensino facilitada pela inteligência artificial.
              Transforme horas de trabalho em minutos de criatividade.
            </p>
            <Link
              href="/confeccao"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 shadow-sm"
            >
              <Sparkles size={16} className="fill-current" />
              Criar Avaliação com IA
            </Link>
          </div>

          <div className="relative animate-pulse [animate-duration:3000ms] flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-blue-400/40 md:h-48 md:w-48">
            <div className=" bg-blue-600 p-4 rounded-full text-white flex items-center justify-center h-16 w-16">
              <Brain size={30} />
            </div>
          </div>
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
