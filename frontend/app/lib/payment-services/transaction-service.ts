import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { createSolanaTransaction } from "./payment";

// Fixed recipient address for mint transactions
const RECIPIENT_ADDRESS = "4uockXKuNbtNvayaJp5czTDSj5PeF5ssaYFLxVziRzBx";
const MINT_FEE = 0.0001; // SOL amount for minting

export interface MintTransactionResult {
  success: boolean;
  transaction?: Transaction;
  txId?: string;
  error?: string;
  mintAddress?: string;
}

/**
 * Creates a transaction for minting an NFT by sending a small amount of SOL
 */
export const createMintTransaction = async (
  walletAddress: string,
  mintAddress: string,
): Promise<MintTransactionResult> => {
  try {
    if (!walletAddress) {
      return { success: false, error: "No wallet address provided" };
    }

    const transaction = await createSolanaTransaction(
      walletAddress,
      RECIPIENT_ADDRESS,
      MINT_FEE,
    );

    return {
      success: true,
      transaction,
      mintAddress,
    };
  } catch (error: any) {
    console.error("Error creating mint transaction:", error);
    return {
      success: false,
      error: error.message || "Failed to create mint transaction",
    };
  }
};

/**
 * Execute a mint transaction using the user's wallet
 */
export const executeMintTransaction = async (
  wallet: any,
  transaction: Transaction,
  mintAddress: string,
): Promise<MintTransactionResult> => {
  try {
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed",
    );

    let signature: string;

    if (typeof wallet.signTransaction === "function") {
      // For wallets that support signing transactions
      const signedTx = await wallet.signTransaction(transaction);
      signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");
    } else if (typeof wallet.sendTransaction === "function") {
      // For wallets like Phantom that handle both signing and sending
      const result = await wallet.sendTransaction(transaction, connection);
      signature = result.signature || result;
      // Most wallet adapters return the signature directly
      await connection.confirmTransaction(signature, "confirmed");
    } else {
      return {
        success: false,
        error: "Wallet doesn't support required methods for transactions",
      };
    }

    // Get transaction details for verification if needed
    const txDetails = await connection.getTransaction(signature, {
      commitment: "confirmed",
    });

    return {
      success: true,
      txId: signature,
      mintAddress,
    };
  } catch (error: any) {
    console.error("Error executing mint transaction:", error);
    return {
      success: false,
      error: error.message || "Failed to execute mint transaction",
    };
  }
};
