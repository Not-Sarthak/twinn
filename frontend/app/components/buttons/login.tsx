"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const { login, authenticated, user } = usePrivy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (authenticated && user) {
      try {
        console.log("User authenticated:", user.id);
        router.refresh();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }, [authenticated, user, router]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();
    } catch (error) {
      console.error("Login Failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <button
      className="flex place-items-center space-x-1 rounded-full bg-dark-primary px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-dark-primary/90 hover:text-white"
      onClick={handleLogin}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? "Connecting..." : "Log In"}
    </button>
  );
}
