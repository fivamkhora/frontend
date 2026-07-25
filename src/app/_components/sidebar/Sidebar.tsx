"use client";

import { useRouter } from "next/navigation";
import {
  GraduationCap,
  type LucideIcon,
  Users,
  FilePlus2,
  Files,
  Home,
  Brain,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

import { logout } from "@/services/authService";
import { CustomNavLink } from "./components/CustomNavLink";
import SidebarFooter from "./components/SidebarFooter";
import { useAuth, UserRole } from "@/context/AuthContext";

type AppLayoutActiveItem =
  | "home"
  | "alunos"
  | "classes"
  | "secretaria"
  | "confeccao"
  | "atribuirprova"
  | "provas";

type SidebarProps = {
  active: AppLayoutActiveItem;
};

const ALL_ROLES: readonly UserRole[] = [
  "Administrador",
  "Professor",
  "Aluno",
];
const ACADEMIC_MANAGEMENT_ROLES: readonly UserRole[] = [
  "Administrador",
  "Professor",
];
const ADMIN_ONLY_ROLES: readonly UserRole[] = ["Administrador"];

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
    href: "/classes",
    icon: GraduationCap,
    key: "classes",
    label: "Classes",
    roles: ACADEMIC_MANAGEMENT_ROLES,
  },
  {
    href: "/alunos/mock/desempenho",
    icon: BarChart3,
    key: "alunos",
    label: "Desempenho",
    roles: ALL_ROLES,
  },
  {
    href: "/secretaria",
    icon: Users,
    key: "secretaria",
    label: "Secretaria",
    roles: ADMIN_ONLY_ROLES,
  },
  {
    href: "/confeccao",
    icon: FilePlus2,
    key: "confeccao",
    label: "Confeccionar provas",
    roles: ACADEMIC_MANAGEMENT_ROLES,
  },
  {
    href: "/provas",
    icon: Files,
    key: "provas",
    label: "Lista de provas",
    roles: ACADEMIC_MANAGEMENT_ROLES,
  },
  {
    href: "/atribuirprova",
    icon: ClipboardCheck,
    key: "atribuirprova",
    label: "Atribuir provas",
    roles: ACADEMIC_MANAGEMENT_ROLES,
  },
];

export default function Sidebar({ active }: SidebarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
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
        {filteredNavItems.map((item) => {
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

      <div className="p-3">
        <SidebarFooter onLogout={handleLogout} />
      </div>
    </aside>
  );
}
