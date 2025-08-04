// app/(authenticated)/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

// This component acts as a "smart redirector" for the /profile route.
export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the authentication check is complete
    if (loading) {
      return; // Do nothing while we're still checking who is logged in
    }

    if (user && user.username) {
      // If we have a logged-in user, redirect to their dynamic profile page
      console.log(`User found ('${user.username}'), redirecting to their profile.`);
      router.replace(`/profile/${user.username}`);
    } else {
      // If no user is found after loading, they are not logged in.
      // Redirect them to the login page.
      console.log("No user found, redirecting to login.");
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  // Render a loading state while the redirect is happening
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-gray-600">Loading your profile...</p>
    </div>
  );
}