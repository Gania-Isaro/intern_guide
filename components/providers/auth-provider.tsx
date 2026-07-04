"use client";

import * as React from "react";
import { apiFetch } from "@/lib/utils";

export type UserRole = "student" | "company_owner" | "admin";

export interface AuthUser {
  user_id: number;
  email: string;
  role: UserRole;
  is_verified: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
const MOCK_USER: AuthUser = {
  user_id: 1,
  email: "aline.m@alustudent.com",
  role: "student",
  is_verified: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUser = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (MOCK_AUTH) {
        await new Promise((r) => setTimeout(r, 200));
        setUser(MOCK_USER);
        return;
      }
      const data = await apiFetch("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = React.useCallback(async () => {
    try {
      if (!MOCK_AUTH) {
        await apiFetch("/auth/logout", { method: "POST" });
      }
    } finally {
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    refetch: fetchUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}