"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import axios from "axios";

export function useAuthStatus() {
  const { authenticated, ready, user } = usePrivy();
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  useEffect(() => {
    if (user?.linkedAccounts) {
      const solanaWallet = user.linkedAccounts.find(
        (account) => account.type === "wallet" && account.chainType === "solana"
      );
      
      if (solanaWallet && "address" in solanaWallet) {
        const address = (solanaWallet as any).address;
        setSolanaAddress(address);
        localStorage.setItem("solanaAddress", address);
      }
    }
  }, [user]);

  // Register user with backend when authenticated
  useEffect(() => {
    if (authenticated && user && user.id) {
      localStorage.setItem("userDID", user.id);
      
      const solanaWallet = user.linkedAccounts?.find(
        (account) => account.type === "wallet" && account.chainType === "solana"
      );
      
      if (solanaWallet && "address" in solanaWallet) {
        const walletAddress = (solanaWallet as any).address;
        
        // Log all user properties to debug
        console.log("Full user object:", user);
        
        // Get name from the user object
        const name = user.google?.name || "Sarthak Shah";
        
        console.log("Using name:", name);
        
        console.log("Registering user with backend:", {
          privyDID: user.id,
          email: user.email?.address,
          name,
          walletAddress: walletAddress
        });
        
        // Register user with backend using axios
        axios.post("http://localhost:3000/api/users/register", {
          privyDID: user.id,
          email: user.email?.address,
          name,
          walletAddress: walletAddress
        })
        .then(response => {
          console.log("User registration successful:", response.data);
        })
        .catch(error => {
          console.error("User registration failed:", error.response?.data || error.message);
        });
      }
    }
  }, [authenticated, user]);

  if (authenticated && user) {
    console.log("Authenticated", authenticated);
    console.log("User ID", user?.id);
    console.log("User Created At", user?.createdAt);
    console.log("Email", user?.email?.address);
    console.log("Name:", user?.google?.name);
    console.log("Solana Address:", solanaAddress);
  }

  return {
    isAuthenticated: authenticated,
    ready,
    user,
    userDID: user?.id,
    userEmail: user?.email?.address,
    userName: user?.google?.name,
    userSolanaAddress: solanaAddress,
    userCreatedAt: user?.createdAt,
  };
}
