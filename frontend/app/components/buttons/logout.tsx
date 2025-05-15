"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export function LogoutButton() {
  const { logout } = usePrivy();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear user data from local storage
      localStorage.removeItem("userDID");
      localStorage.removeItem("solanaAddress");

      // Logout from Privy
      await logout();

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout Failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      className="flex place-items-center space-x-1 rounded-full bg-dark-primary px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-dark-primary/90 hover:text-white"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging Out..." : "Log Out"}
    </button>
  );
}
