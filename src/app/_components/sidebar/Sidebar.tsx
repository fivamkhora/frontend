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
  ClipboardCheck,
} from "lucide-react";

import { logout } from "@/services/authService";
import { CustomNavLink } from "./components/CustomNavLink";
import SidebarFooter from "./components/SidebarFooter";
import { useAuth, UserRole } from "@/context/AuthContext";

type AppLayoutActiveItem =
  | "home"
  | "classes"
  | "secretaria"
  | "confeccao"
  | "atribuirprova"
  | "provas";

type SidebarProps = {
  active: AppLayoutActiveItem;
};

const navItems: Array<{
  href: string;
  icon: LucideIcon;
  key: AppLayoutActiveItem;
  label: string;
  roles: UserRole[];
}> = [
  {
    href: "/dashboard",
    icon: Home,
    key: "home",
    label: "Home",
    roles: ["Administrador", "Professor", "Aluno"],
  },
  {
    href: "/classes",
    icon: GraduationCap,
    key: "classes",
    label: "Classes",
    roles: ["Administrador", "Professor"],
  },
  {
    href: "/secretaria",
    icon: Users,
    key: "secretaria",
    label: "Secretaria",
    roles: ["Administrador"],
  },
  {
    href: "/confeccao",
    icon: FilePlus2,
    key: "confeccao",
    label: "Confeccionar provas",
    roles: ["Administrador", "Professor"],
  },
  {
    href: "/provas",
    icon: Files,
    key: "provas",
    label: "Lista de provas",
    roles: ["Administrador", "Professor", "Aluno"],
  },
  {
    href: "/atribuirprova",
    icon: ClipboardCheck,
    key: "atribuirprova",
    label: "Atribuir provas",
    roles: ["Administrador", "Professor"],
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
