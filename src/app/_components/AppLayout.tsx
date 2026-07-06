"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  FilePlus2,
  Files,
  GraduationCap,
  Home,
  type LucideIcon,
  LogOut,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  fetchAuthenticatedUser,
  logout,
  type AuthenticatedUser,
} from "@/services/authService";

type AppLayoutActiveItem =
  | "home"
  | "classes"
  | "secretaria"
  | "confeccao"
  | "provas";

type AppLayoutProps = {
  active: AppLayoutActiveItem;
  children: ReactNode;
  user?: AuthenticatedUser | null;
};

const navItems: Array<{
  href: string;
  icon: LucideIcon;
  key: AppLayoutActiveItem;
  label: string;
}> = [
  { href: "/dashboard", icon: Home, key: "home", label: "Home" },
  { href: "/classes", icon: GraduationCap, key: "classes", label: "Classes" },
  {
    href: "/secretaria",
    icon: Users,
    key: "secretaria",
    label: "Secretaria",
  },
  {
    href: "/confeccao",
    icon: FilePlus2,
    key: "confeccao",
    label: "Confeccionar provas",
  },
  { href: "/provas", icon: Files, key: "provas", label: "Lista de provas" },
];

export function AppLayout({ active, children, user }: AppLayoutProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(
    user ?? null,
  );

  useEffect(() => {
    if (user !== undefined) {
      setCurrentUser(user);
      return;
    }

    let mounted = true;

    async function loadUser() {
      try {
        const authenticatedUser = await fetchAuthenticatedUser();

        if (mounted) {
          setCurrentUser(authenticatedUser);
        }
      } catch {
        if (mounted) {
          setCurrentUser(null);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getNavClassName = (item: AppLayoutActiveItem) =>
    item === active
      ? "mb-1 flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-[#1e3a8a]"
      : "mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1e3a8a]";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <div className="flex min-h-screen">
        <aside className="relative flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex h-14 items-center border-b border-slate-200 px-4">
            <span className="truncate text-sm font-semibold text-slate-900">
              {currentUser?.name || "Professor"}
            </span>
          </div>

          <nav className="flex-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={getNavClassName(item.key)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="h-14 border-b border-slate-200 bg-white" />
          {children}
        </main>
      </div>
    </div>
  );
}
