import { AuthenticatedUser } from "@/services/authService";
import { UserCircle } from "lucide-react";
import React from "react";

type HeaderProps = {
  user?: AuthenticatedUser | null;
};

export default function Header({ user }: HeaderProps) {
  const userName = user?.name || "Professor";

  return (
    <header className="flex h-14 w-full items-center justify-end border-b border-slate-200 bg-white px-6">
      <div className="flex items-center">
        <span className="text-sm font-semibold flex items-center gap-3 text-slate-700">
          {userName} <UserCircle size={30} />
        </span>
      </div>
    </header>
  );
}
