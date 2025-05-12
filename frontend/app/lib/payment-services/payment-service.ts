import { Connection } from "@solana/web3.js";
import { createSolanaTransaction } from "./payment";

const SOLANA_DEVNET_URL = "https://api.devnet.solana.com";

const RECIPIENT_ADDRESS = "4uockXKuNbtNvayaJp5czTDSj5PeF5ssaYFLxVziRzBx";

interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Process a crypto payment using Solana
 */
export const processWalletPayment = async (
  wallet: any,
  amount: number,
): Promise<PaymentResult> => {
  try {
    if (!wallet) {
      return { success: false, error: "No wallet connected" };
    }

    const connection = new Connection(SOLANA_DEVNET_URL, "confirmed");

    console.log("amount", amount);

    const transaction = await createSolanaTransaction(
      wallet.address,
      RECIPIENT_ADDRESS,
      amount,
    );

    if (typeof wallet.signTransaction === "function") {
      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
      );
      await connection.confirmTransaction(signature, "confirmed");

      return { success: true, txHash: signature };
    } else if (typeof wallet.sendTransaction === "function") {
      const result = await wallet.sendTransaction(transaction);
      const signature = result.signature || result;

      return { success: true, txHash: signature };
    } else {
      return {
        success: false,
        error: "Wallet doesn't support required methods for transactions",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unknown error processing payment",
    };
  }
};
