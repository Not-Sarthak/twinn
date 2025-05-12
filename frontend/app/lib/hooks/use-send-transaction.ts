import { useState } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

type TransactionStatus = "idle" | "sending" | "success" | "error";

export const useSendTransaction = () => {
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = async (
    wallet: any,
    recipientAddress: string,
    amount: number,
  ) => {
    console.log("[useSendTransaction] Starting transaction", {
      wallet: !!wallet,
      recipientAddress,
      amount,
    });
    console.log("[useSendTransaction] Wallet methods:", Object.keys(wallet));

    setStatus("sending");
    setError(null);
    setTxHash(null);

    try {
      // Create a connection to Solana devnet
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed",
      );
      console.log("[useSendTransaction] Connected to Solana devnet");

      // Create a transaction
      const transaction = new Transaction();
      console.log("[useSendTransaction] Created transaction");

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      console.log("[useSendTransaction] Got blockhash:", blockhash);

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(wallet.address);

      console.log("[useSendTransaction] Adding transfer instruction", {
        from: wallet.address,
        to: recipientAddress,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(wallet.address),
          toPubkey: new PublicKey(recipientAddress),
          lamports: amount * LAMPORTS_PER_SOL,
        }),
      );

      // Different wallet implementations have different ways to sign/send transactions
      if (typeof wallet.sendSol === "function") {
        console.log("[useSendTransaction] Using wallet.sendSol method");
        const result = await wallet.sendSol(recipientAddress, amount);
        console.log("[useSendTransaction] sendSol result:", result);

        const signature = result.signature;
        console.log("[useSendTransaction] Got signature:", signature);
        setTxHash(signature);
        setStatus("success");
        return signature;
      }

      if (typeof wallet.sendTransaction === "function") {
        console.log("[useSendTransaction] Using wallet.sendTransaction method");
        const result = await wallet.sendTransaction(transaction);
        console.log("[useSendTransaction] sendTransaction result:", result);

        const signature = result.signature || result;
        console.log("[useSendTransaction] Setting txHash to:", signature);
        setTxHash(signature);
        setStatus("success");
        return signature;
      }

      // Try to use signTransaction method (Privy wallets often use this pattern)
      if (typeof wallet.signTransaction === "function") {
        console.log("[useSendTransaction] Using wallet.signTransaction method");

        try {
          const signedTx = await wallet.signTransaction(transaction);
          console.log("[useSendTransaction] Transaction signed", signedTx);

          console.log("[useSendTransaction] Sending raw transaction");
          const signature = await connection.sendRawTransaction(
            signedTx.serialize(),
          );
          console.log(
            "[useSendTransaction] Raw transaction sent, signature:",
            signature,
          );

          console.log("[useSendTransaction] Confirming transaction");
          await connection.confirmTransaction(signature, "confirmed");
          console.log("[useSendTransaction] Transaction confirmed");

          setTxHash(signature);
          setStatus("success");
          return signature;
        } catch (err) {
          console.error(
            "[useSendTransaction] Error with signTransaction:",
            err,
          );
          throw err;
        }
      }

      console.error("[useSendTransaction] No suitable method found on wallet", {
        hasSendSol: typeof wallet.sendSol === "function",
        hasSendTransaction: typeof wallet.sendTransaction === "function",
        hasSignTransaction: typeof wallet.signTransaction === "function",
        walletMethods: Object.keys(wallet),
      });
      throw new Error(
        "Wallet doesn't support required methods for transactions",
      );
    } catch (err: any) {
      console.error("[useSendTransaction] Error sending transaction:", err);
      console.error("[useSendTransaction] Error details:", {
        message: err.message,
        code: err.code,
      });
      setError(err.message || "Failed to send transaction");
      setStatus("error");
      throw err;
    }
  };

  return {
    sendTransaction,
    status,
    txHash,
    error,
  };
};
