"use client";

import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";
import {
  fetchAuthenticatedUser,
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

export function AppLayout({ active, children, user }: AppLayoutProps) {
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

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar active={active} />

        <main className="min-w-0 flex-1">
          <Header user={currentUser} />
          {children}
        </main>
      </div>
    </div>
  );
}
