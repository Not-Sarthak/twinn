import dotenv from "dotenv";
import { createSolanaRpc } from "@solana/kit";

dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";

export const getRpcClient = () => {
  console.log(`Using RPC URL: ${RPC_URL}`);
  const rpc = createSolanaRpc(RPC_URL);
  return rpc;
};

export const initRpcClients = () => {
  const rpc = getRpcClient();
  console.log("Created RPC Clients");
  return { rpc };
};
