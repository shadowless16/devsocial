// lib/auth-client.ts
"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuth as useAppAuth } from "@/contexts/app-context";

export const useAuthClient = () => {
  const router = useRouter();

  const login = async (credentials: { usernameOrEmail: string; password: string }) => {
    const result = await signIn("credentials", {
      usernameOrEmail: credentials.usernameOrEmail,
      password: credentials.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.ok) {
      router.push("/home");
    }

    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  return { login, logout };
};

// Use the centralized auth from AppContext
export const useAuth = useAppAuth;

// Helper function for API calls with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = "/auth/login";
    return null;
  }

  return response;
};