"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function useAuthStatus() {
  const { authenticated, ready, user } = usePrivy();
  const [isClient, setIsClient] = useState(false);
  const [storedDID, setStoredDID] = useState<string | null>(null);
  const [storedAddress, setStoredAddress] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const did = localStorage.getItem("userDID");
      const address = localStorage.getItem("solanaAddress");

      setStoredDID(did);
      setStoredAddress(address);
    }
  }, [isClient]);

  useEffect(() => {
    if (authenticated && user) {
      setStoredDID(user.id);

      const solanaWallet = user.linkedAccounts?.find(
        (account) =>
          account.type === "wallet" && account.chainType === "solana",
      );

      if (solanaWallet) {
        setStoredAddress((solanaWallet as any).address);
      }
    }
  }, [authenticated, user]);

  const isAuthenticated = authenticated || (isClient && !!storedDID);

  return {
    isAuthenticated,
    ready,
    user,
    storedDID,
    storedAddress,
    isClient,
  };
}