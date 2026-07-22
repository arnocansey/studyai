"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { bffFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  xp: number;
  streak: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    name: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, login: storeLogin, logout: storeLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        let data: (User & { accessToken?: string }) | null = null;
        try {
          data = await bffFetch<User & { accessToken?: string }>(
            "/api/auth/me",
          );
        } catch {
          // Try refresh once
          try {
            await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            });
            data = await bffFetch<User & { accessToken?: string }>(
              "/api/auth/me",
            );
          } catch {
            data = null;
          }
        }

        if (cancelled) return;
        if (!data?.accessToken) {
          storeLogout();
          return;
        }
        const { accessToken, ...userData } = data;
        storeLogin(
          {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            xp: userData.xp,
            streak: userData.streak,
          },
          accessToken,
        );
      } catch {
        if (!cancelled) storeLogout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [storeLogin, storeLogout]);

  const login = async (email: string, password: string) => {
    const data = await bffFetch<{ user: User; accessToken: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    storeLogin(data.user, data.accessToken);
  };

  const register = async (regData: {
    email: string;
    name: string;
    password: string;
    role?: string;
  }) => {
    const data = await bffFetch<{ user: User; accessToken: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(regData),
      },
    );
    storeLogin(data.user, data.accessToken);
  };

  const logout = () => {
    void fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    storeLogout();
  };

  const loginWithGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const loginWithGitHub = () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
