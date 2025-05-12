import { unstable_noStore as noStore } from "next/cache";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JWT, NEXT_PUBLIC_RPC_URL } from "./constants";
import { IPFSUploadResult } from "./types";
import { createSolanaRpc } from "@solana/kit";

export const formatDate = (date: string) => {
  noStore();
  let currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  let fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `${fullDate} (${formattedDate})`;
};

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string | undefined, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

export async function uploadToIPFS(
  fileToUpload: File,
): Promise<IPFSUploadResult | null> {
  const formData = new FormData();
  formData.append("file", fileToUpload);

  const pinataMetadata = JSON.stringify({ name: fileToUpload.name });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 0 });
  formData.append("pinataOptions", pinataOptions);

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`IPFS upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    const hash = data.IpfsHash;

    const result = {
      hash,
      ipfs_url: `ipfs://${hash}`,
      gateway_url: `https://ipfs.io/ipfs/${hash}`,
      pinata_gateway_url: `https://gateway.pinata.cloud/ipfs/${hash}`,
    };

    console.log(
      "IPFS upload successful:",
      JSON.stringify(
        {
          name: fileToUpload.name,
          type: fileToUpload.type,
          size: fileToUpload.size,
          ...result,
        },
        null,
        2,
      ),
    );

    return result;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return null;
  }
}

export const getRpcClient = () => {
  console.log(`Using RPC URL: ${NEXT_PUBLIC_RPC_URL}`);
  const rpc = createSolanaRpc(NEXT_PUBLIC_RPC_URL);
  return rpc;
};

export const initRpcClients = () => {
  const rpc = getRpcClient();
  console.log("Created RPC Clients");
  return { rpc };
};
