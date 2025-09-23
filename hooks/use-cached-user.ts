// hooks/use-cached-user.ts
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/app-context";

export function useCachedUser() {
  const { user, loading } = useAuth();
  
  // Function to manually refresh user data (handled by AppContext)
  const refreshUser = async () => {
    // This will be handled by the AppContext refresh mechanism
    window.location.reload();
  };

  return { user, loading, refreshUser };
}
