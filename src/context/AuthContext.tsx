"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  fetchAuthenticatedUser,
  type AuthenticatedUser,
} from "@/services/authService";

export type UserRole = "Administrador" | "Professor" | "Aluno";

export type ExtendedUser = AuthenticatedUser & {
  role: UserRole;
};

type AuthContextType = {
  user: ExtendedUser | null;
  isLoading: boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: ExtendedUser | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<ExtendedUser | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const authenticatedUser = await fetchAuthenticatedUser();
      setUser((authenticatedUser as ExtendedUser) || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const authenticatedUser = await fetchAuthenticatedUser();
        if (mounted) {
          setUser((authenticatedUser as ExtendedUser) || null);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  const logout = useCallback(async () => {
    setUser(null);
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    } finally {
      router.refresh();
      router.push("/login");
      setIsLoading(false);
    }
  }, [router]);

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, hasRole, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
