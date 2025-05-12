import { shortenAddress } from "@/app/lib/utils";
import { ExternalLink } from "lucide-react";

interface StatusMessageProps {
  message: string;
  isError: boolean;
  txHash?: string;
}

export function StatusMessage({
  message,
  isError,
  txHash,
}: StatusMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`mb-6 rounded-xl flex items-center justify-between p-4 ${
        isError
          ? "border border-red-200 bg-red-50 text-red-700"
          : "border border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {message}
      {txHash && (
        <a
          href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:underline ml-2 flex items-center gap-1"
        >
          View Transaction <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
