import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SessionUser, Permission } from "@hcmos/shared";
import { api, tokens } from "./api.js";

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  setSession: (accessToken: string, refreshToken: string, user: SessionUser) => void;
  logout: () => Promise<void>;
  can: (perm: Permission) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokens.access) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => tokens.clear())
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      setSession: (accessToken, refreshToken, u) => {
        tokens.set(accessToken, refreshToken);
        setUser(u);
      },
      logout: async () => {
        try {
          await api.logout();
        } catch {
          /* ignore */
        }
        tokens.clear();
        setUser(null);
      },
      can: (perm) => Boolean(user?.permissions.includes(perm)),
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
