"use client";

import { useRouter } from "next/navigation";
import {
  GraduationCap,
  type LucideIcon,
  FilePlus2,
  Files,
  Home,
  Brain,
  BarChart3,
  ClipboardCheck,
  NotebookPen,
  Users,
  Award,
  FileCheck2,
} from "lucide-react";

import { CustomNavLink } from "./components/CustomNavLink";
import SidebarFooter from "./components/SidebarFooter";
import { useAuth, UserRole } from "@/context/AuthContext";

type AppLayoutActiveItem =
  | "home"
  | "secretaria"
  | "provasAluno"
  | "alunos"
  | "classes"
  | "confeccao"
  | "atribuirprova"
  | "provas"
  | "avaliacoes"
  | "notas";

type SidebarProps = {
  active: AppLayoutActiveItem;
};

const ALL_ROLES: readonly UserRole[] = ["Administrador", "Professor", "Aluno"];
const PROFESSOR_AND_ADMIN_ROLES: readonly UserRole[] = [
  "Administrador",
  "Professor",
];
const ADMIN_ONLY_ROLES: readonly UserRole[] = ["Administrador"];
const STUDENT_ONLY_ROLES: readonly UserRole[] = ["Aluno"];

const navItems: Array<{
  href: string;
  icon: LucideIcon;
  key: AppLayoutActiveItem;
  label: string;
  roles: readonly UserRole[];
}> = [
  {
    href: "/dashboard",
    icon: Home,
    key: "home",
    label: "Home",
    roles: ALL_ROLES,
  },
  {
    href: "/aluno/provas",
    icon: FileCheck2,
    key: "provasAluno",
    label: "Minhas provas",
    roles: STUDENT_ONLY_ROLES,
  },
  {
    href: "/secretaria",
    icon: Users,
    key: "secretaria",
    label: "Secretaria",
    roles: ADMIN_ONLY_ROLES,
  },
  {
    href: "/classes",
    icon: GraduationCap,
    key: "classes",
    label: "Classes",
    roles: PROFESSOR_AND_ADMIN_ROLES,
  },
  {
    href: "/confeccao",
    icon: FilePlus2,
    key: "confeccao",
    label: "Confeccionar provas",
    roles: PROFESSOR_AND_ADMIN_ROLES,
  },
  {
    href: "/provas",
    icon: Files,
    key: "provas",
    label: "Lista de provas",
    roles: PROFESSOR_AND_ADMIN_ROLES,
  },
  {
    href: "/avaliacoes",
    icon: NotebookPen,
    key: "avaliacoes",
    label: "Avaliações",
    roles: ALL_ROLES,
  },
  {
    href: "/atribuirprova",
    icon: ClipboardCheck,
    key: "atribuirprova",
    label: "Atribuir provas",
    roles: PROFESSOR_AND_ADMIN_ROLES,
  },
  {
    href: "/alunos/mock/desempenho",
    icon: BarChart3,
    key: "alunos",
    label: "Desempenho",
    roles: PROFESSOR_AND_ADMIN_ROLES,
  },
  {
    href: "/notas",
    icon: Award,
    key: "notas",
    label: "Minhas Notas",
    roles: STUDENT_ONLY_ROLES,
  },
];

export default function Sidebar({ active }: SidebarProps) {
  const router = useRouter();
  const { isLoading, user, logout } = useAuth();

  const handleLogout = async () => {
    if (logout) {
      await logout();
    } else {
      router.push("/login");
    }
  };

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside className="sticky top-0 h-screen w-72 border-r bg-white flex flex-col shrink-0">
      <div className="flex h-14 items-center px-6">
        <h1 className="text-2xl text-blue-600 flex items-center gap-3 font-bold">
          <Brain />
          Khora
        </h1>
      </div>

      <nav className="flex flex-1 flex-col p-3 gap-3 mt-5">
        {isLoading
          ? Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-11 animate-pulse rounded-lg bg-slate-100"
              />
            ))
          : filteredNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <CustomNavLink
                  key={item.key}
                  href={item.href}
                  icon={<Icon size={18} />}
                  isActive={active === item.key}
                >
                  {item.label}
                </CustomNavLink>
              );
            })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <SidebarFooter onLogout={handleLogout} />
      </div>
    </aside>
  );
}
