"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Database,
  ClipboardCheck,
  BarChart3,
  Settings,
  Brain,
  House,
} from "lucide-react";
import { CustomNavLink } from "./components/CustomNavLink";
import { SidebarActionButton } from "./components/SidebarActionButton";
import { SidebarUserFooter } from "./components/SidebarUserFooter";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col justify-between border-r border-gray-200 bg-white px-4 py-6">
      <div className="flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 text-xl font-bold tracking-tight text-blue-600"
        >
          <Brain /> Khora{" "}
        </Link>

        <nav>
          <ul className="m-0 flex flex-col gap-1 p-0">
            <CustomNavLink href="/dashboard" icon={<House size={18} />}>
              Home
            </CustomNavLink>

            <CustomNavLink href="/provas" icon={<ClipboardCheck size={18} />}>
              Provas
            </CustomNavLink>
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <SidebarActionButton
          label="Criar nova avaliação"
          onClick={() => router.push("/confeccao")}
        />

        <SidebarUserFooter
          userName="Prof. Ricardo"
          userImage={null}
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}
