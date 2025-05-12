"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { ExternalLink, CheckCircle, Copy } from "lucide-react";
import { getWalletAddress } from "@/app/lib/payment-services/payment";
import { copyToClipboard } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";

interface MintStatus {
  step: "idle" | "processing" | "complete" | "error";
  error?: string;
  txId?: string;
}

export default function MintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-orange-50">
          <div className="h-8 w-32 animate-pulse rounded-xl bg-orange-100"></div>
        </div>
      }
    >
      <MintPageContent />
    </Suspense>
  );
}

function MintPageContent() {
  const searchParams = useSearchParams();
  const mintAddress = searchParams.get("mintAddress");
  const uniqueCode = searchParams.get("uniqueCode");

  const [status, setStatus] = useState<MintStatus>({ step: "idle" });
  const [copied, setCopied] = useState(false);
  const { authenticated, user, login, ready } = usePrivy();

  const walletAddress = getWalletAddress(user);

  const handleMint = async () => {
    if (!authenticated || !mintAddress || !uniqueCode) {
      return;
    }

    setStatus({ step: "processing" });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus({
        step: "complete",
        txId: "5oKTGKkJ5QsorHnnEBX1tBjs4szBD79hdcyxjpaABgQZrtdBAqJohV48SATbeoXRLTJJaxFQrkjqxUZ9DVNJZ75H",
      });
    } catch (error: any) {
      setStatus({
        step: "error",
        error: error.message || "Failed to execute transaction",
      });
    }
  };

  const handleRetry = () => {
    setStatus({ step: "idle" });
  };

  const openInExplorer = (txId: string) => {
    const baseUrl = "https://explorer.solana.com";
    const cluster = "devnet";
    const url = `${baseUrl}/tx/${txId}?cluster=${cluster}`;
    window.open(url, "_blank");
  };

  const copyTxId = (txId: string) => {
    navigator.clipboard.writeText(txId);
  };

  const shareTxId = (txId: string) => {
    const url = `https://explorer.solana.com/tx/${txId}?cluster=devnet`;
    navigator
      .share({
        title: "Twinn NFT Mint",
        text: "Check out my Twinn NFT mint",
        url,
      })
      .catch(() => {
        // Fallback for browsers that don't support share API
        navigator.clipboard.writeText(url);
      });
  };

  const tweetTxId = (txId: string) => {
    const url = `https://explorer.solana.com/tx/${txId}?cluster=devnet`;
    window.open(
      `https://twitter.com/intent/tweet?text=Just minted my Twinn NFT! 🎉&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  const handleCopyAddress = async () => {
    if (walletAddress) {
      const success = await copyToClipboard(walletAddress);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-orange-50">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-orange-100"></div>
      </div>
    );
  }

  if (!mintAddress || !uniqueCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-orange-50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-200 bg-white p-6 shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <h2 className="text-center text-lg font-semibold text-gray-900">
            Invalid Mint Link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            This link appears to be invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <div className="container mx-auto max-w-md px-4 py-10">
          <div className="flex flex-col items-center">
            {/* NFT Card */}
            <div className="mb-8 w-full overflow-hidden rounded-3xl border-2 border-text-secondary/50 bg-white">
              <div className="relative w-full">
                <div className="flex h-full items-center justify-center">
                  <Image
                    src="/twinn.png"
                    alt="Twinn Launch"
                    width={400}
                    height={400}
                    className="h-auto w-auto rounded-3xl shadow-md"
                  />
                </div>
                <div className="p-6">
                  <div className="flex w-full items-center justify-between">
                    <h1 className="font-garamond text-2xl italic text-gray-900">
                      Twinn Launch NFT
                    </h1>
                    <div>
                      <span className="font-mono text-sm text-gray-900">
                        {uniqueCode}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        {walletAddress && (
                          <>
                            {walletAddress.substring(0, 6)}...
                            {walletAddress.substring(walletAddress.length - 4)}
                          </>
                        )}
                      </span>
                      {walletAddress && (
                        <button
                          onClick={handleCopyAddress}
                          className="rounded-full p-1 hover:bg-gray-100"
                          title="Copy to clipboard"
                        >
                          {copied ? (
                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-gray-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              {!authenticated ? (
                <Button
                  onClick={login}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg"
                >
                  Connect Wallet
                </Button>
              ) : status.step === "idle" ? (
                <div>
                  <Button
                    onClick={handleMint}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg"
                  >
                    Mint NFT
                  </Button>
                </div>
              ) : status.step === "processing" ? (
                <Button
                  disabled
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                >
                  <div className="mr-2 h-4 w-4 animate-spin rounded-xl border-2 border-white border-t-transparent"></div>
                  Processing...
                </Button>
              ) : status.step === "complete" ? (
                <div className="space-y-4">
                  <Button
                    onClick={() => status.txId && openInExplorer(status.txId)}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Transaction
                  </Button>
                </div>
              ) : status.step === "error" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                    <p className="text-sm text-gray-600">
                      {status.error || "There was an error minting your NFT"}
                    </p>
                  </div>

                  <Button
                    onClick={handleRetry}
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
