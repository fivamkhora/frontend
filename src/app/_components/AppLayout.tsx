"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";
import { useAuth } from "@/context/AuthContext";

type AppLayoutActiveItem =
  | "home"
  | "provasAluno"
  | "alunos"
  | "classes"
  | "secretaria"
  | "confeccao"
  | "atribuirprova"
  | "provas"
  | "avaliacoes"
  | "notas";

type AppLayoutProps = {
  active: AppLayoutActiveItem;
  children: ReactNode;
};

export function AppLayout({ active, children }: AppLayoutProps) {
  const { user } = useAuth();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 relative">
      <div className="flex min-h-screen">
        <Sidebar active={active} />

        <main className="min-w-0 flex-1">
          <Header user={user} />
          {children}
        </main>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
        className={`fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3b63] text-white shadow-lg transition-all duration-300 hover:bg-[#0a2845] hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
          showScroll
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-10 opacity-0"
        }`}
      >
        <ArrowUp size={22} className="stroke-[2.5]" />
      </button>
    </div>
  );
}
