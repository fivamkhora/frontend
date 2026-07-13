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
} from "lucide-react";

import { logout } from "@/services/authService";
import { CustomNavLink } from "./components/CustomNavLink";
import SidebarFooter from "./components/SidebarFooter";

type AppLayoutActiveItem =
  | "home"
  | "classes"
  | "secretaria"
  | "confeccao"
  | "provas";

type SidebarProps = {
  active: AppLayoutActiveItem;
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
  {
    href: "/provas",
    icon: Files,
    key: "provas",
    label: "Lista de provas",
  },
];

export default function Sidebar({ active }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-14 items-center px-6  ">
        <h1 className="text-2xl text-blue-600 flex items-center gap-3 font-bold">
          <Brain />
          Khora
        </h1>
      </div>

      <nav className="flex flex-1 flex-col p-3 gap-3 mt-5">
        {navItems.map((item) => {
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

      <div className="p-3 ">
        <SidebarFooter onLogout={handleLogout} />
      </div>
    </aside>
  );
}
