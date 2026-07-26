"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  refreshUser: () => Promise<ExtendedUser>;
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
  const refreshRequestId = useRef(0);

  const refreshUser = useCallback(async () => {
    const requestId = refreshRequestId.current + 1;
    refreshRequestId.current = requestId;
    setIsLoading(true);

    try {
      const authenticatedUser =
        (await fetchAuthenticatedUser()) as ExtendedUser;

      if (requestId === refreshRequestId.current) {
        setUser(authenticatedUser);
      }

      return authenticatedUser;
    } catch (error) {
      if (requestId === refreshRequestId.current) {
        setUser(null);
      }

      throw error;
    } finally {
      if (requestId === refreshRequestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialUser !== undefined) {
      refreshRequestId.current += 1;
      setUser(initialUser);
      setIsLoading(false);
      return;
    }

    refreshUser().catch(() => undefined);
  }, [initialUser, refreshUser]);

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, hasRole, refreshUser }}
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
