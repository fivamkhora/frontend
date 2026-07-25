"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: ExtendedUser | null;
}) {
  const [user, setUser] = useState<ExtendedUser | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(
    initialUser === undefined,
  );

  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadUser() {
      try {
        const authenticatedUser = await fetchAuthenticatedUser();
        if (mounted) {
          setUser(authenticatedUser as ExtendedUser);
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
  }, [initialUser]);

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, hasRole }}>
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
