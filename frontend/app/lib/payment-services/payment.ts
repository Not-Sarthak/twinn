import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const getWalletAddress = (user: any): string => {
  if (!user) return "";

  const solanaWallet = user.linkedAccounts?.find(
    (account: any) =>
      account.type === "wallet" && account.chainType === "solana",
  );

  return solanaWallet ? (solanaWallet as any).address : "";
};

export const createSolanaTransaction = async (
  walletAddress: string,
  recipientAddress: string,
  amount: number,
): Promise<Transaction> => {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );

  const transaction = new Transaction();

  const { blockhash } = await connection.getLatestBlockhash("finalized");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = new PublicKey(walletAddress);

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(walletAddress),
      toPubkey: new PublicKey(recipientAddress),
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  );

  return transaction;
};
