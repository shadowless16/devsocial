// lib/auth-client.ts
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const { data: session, status } = useSession();
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

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    login,
    logout,
  };
};

// Helper function for API calls with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Include cookies for NextAuth session
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Session expired, redirect to login
    window.location.href = "/auth/login";
    return null;
  }

  return response;
};