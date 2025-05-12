"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { usePrivy } from "@privy-io/react-auth";

export const useBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = usePrivy();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchBalance = async (address: string) => {
    setLoading(true);
    setError(null);
    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed",
      );
      const publicKey = new PublicKey(address);

      const lamports = await connection.getBalance(publicKey);

      const solBalance = lamports / LAMPORTS_PER_SOL;

      setBalance(solBalance);
    } catch (err: any) {
      setError(err.message || "Failed to fetch balance");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const solanaWallet = user?.linkedAccounts?.find(
      (account) => account.type === "wallet" && account.chainType === "solana",
    );
    const walletAddress = solanaWallet ? (solanaWallet as any).address : null;

    const storedAddress = isClient
      ? localStorage.getItem("solanaAddress")
      : null;

    const address = walletAddress || storedAddress;

    if (address) {
      fetchBalance(address);
    } else {
      setLoading(false);
      setBalance(null);
      setError(null);
    }
  }, [user?.linkedAccounts, isClient]);

  return { balance, loading, error, fetchBalance };
};
