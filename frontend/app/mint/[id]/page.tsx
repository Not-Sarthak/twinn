"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStatus } from "../../lib/hooks/use-auth-status";
import { getDropById, mintDrop } from "../../lib/services/drop.service";
import { GridWrapper } from "../../components/ui/grid-wrapper";
import { AnimatedText } from "../../components/ui/animated-text";
import { Button } from "../../components/ui/form-elements";
import { ShimmerCard } from "../../components/ui/shimmer";
import { LoaderCircle, CheckCircle, AlertCircle, Share2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { QRCodeComponent } from "../../components/ui/qr-code";
import { toast, Toaster } from "sonner";

enum MintStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export default function MintPage() {
  const params = useParams();
  const dropId = params.id as string;
  const { isAuthenticated, userDID, userSolanaAddress } = useAuthStatus();
  
  const [drop, setDrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<MintStatus>(MintStatus.IDLE);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const [mintTransaction, setMintTransaction] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrop() {
      if (!dropId) return;
      
      try {
        setLoading(true);
        const response = await getDropById(dropId);
        
        if (response && response.drop) {
          setDrop(response.drop);
        } else {
          setError("Drop not found");
        }
      } catch (err) {
        console.error("Error fetching drop:", err);
        setError("Failed to load drop details");
      } finally {
        setLoading(false);
      }
    }

    fetchDrop();
  }, [dropId]);

  const handleMint = async () => {
    if (!isAuthenticated || !userSolanaAddress) {
      setError("Please connect your wallet to mint");
      return;
    }

    if (!drop || !drop.id) {
      setError("Drop information is missing");
      return;
    }

    try {
      setMintStatus(MintStatus.LOADING);
      
      // For demo purposes - using a hardcoded transaction hash
      const mockTxHash = "hFA97k97QZnNUA6RWqN8t8Pwf9f1a9yenFSs5XCTBjeS4NSTbbwqx24y6iebkWwWn5MyyNYKfyn7WmJbkgTy9iU";
      
      // Call the mintDrop function from the drop service
      const response = await mintDrop(dropId);
      
      if (response && response.success) {
        setMintStatus(MintStatus.SUCCESS);
        setMintedTokenId(response.mintedDrop?.id || null);
        // Use the mock transaction hash for demo
        const txHash = mockTxHash;
        setMintTransaction(txHash);
        
        // Show success toast with transaction link
        toast.success(
          <div className="flex flex-col gap-1">
            <span>Successfully minted!</span>
            <a 
              href={`https://photon.helius.dev/tx/${txHash}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
            >
              View transaction <ExternalLink size={12} />
            </a>
          </div>,
          {
            duration: 5000,
          }
        );
      } else {
        throw new Error(response?.message || "Failed to mint token");
      }
    } catch (err: any) {
      console.error("Error minting token:", err);
      setMintStatus(MintStatus.ERROR);
      
      // Handle specific error cases
      if (err.response?.status === 402) {
        setError("You don't have enough credits to mint this drop. Please purchase more credits.");
        
        toast.error("Not enough credits to mint this drop", {
          description: "Please purchase more credits to continue",
          action: {
            label: "Buy Credits",
            onClick: () => window.location.href = "/buy-credits"
          }
        });
      } else {
        setError(err.response?.data?.error || err.message || "Failed to mint token");
        toast.error("Failed to mint token", {
          description: err.response?.data?.error || err.message || "An error occurred during minting"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GridWrapper>
          <div className="flex flex-col items-center justify-center py-12">
            <ShimmerCard />
            <div className="mt-6 h-8 w-48 animate-pulse rounded-md bg-gray-200"></div>
            <div className="mt-4 h-4 w-64 animate-pulse rounded-md bg-gray-200"></div>
          </div>
        </GridWrapper>
      </div>
    );
  }

  if (error || !drop) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GridWrapper>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold">Error Loading Drop</h1>
            <p className="mb-6 text-gray-600">{error || "Drop not found"}</p>
            <Link 
              href="/gallery" 
              className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Back to Gallery
            </Link>
          </div>
        </GridWrapper>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors closeButton />
      <GridWrapper>
        <div className="flex flex-col items-center justify-center py-8">
          <AnimatedText
            as="h1"
            className="mb-6 text-center font-garamond text-3xl font-medium italic text-text-primary sm:text-4xl"
          >
            Mint Your Token
          </AnimatedText>

          <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
            {/* Mint Card */}
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md lg:flex-1 lg:max-w-lg">
              <div className="rounded-xl bg-white p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4 h-48 w-48 overflow-hidden rounded-xl border-4 border-white shadow-lg">
                    <Image
                      src={drop.image || "https://via.placeholder.com/400"}
                      alt={drop.name || drop.title || "Drop Image"}
                      className="h-full w-full object-cover"
                      width={192}
                      height={192}
                    />
                  </div>
                  
                  <h2 className="mb-1 text-xl font-semibold">{drop.name || drop.title}</h2>
                  
                  {drop.description && (
                    <p className="mb-4 text-center text-sm text-gray-600">{drop.description}</p>
                  )}

                  <div className="mb-6 grid w-full grid-cols-2 gap-4">
                    <div className="rounded-lg bg-orange-100 p-3 text-center">
                      <p className="text-xs text-gray-500">Supply</p>
                      <p className="font-medium">{drop.maxSupply || drop.supply || "∞"}</p>
                    </div>
                    
                    <div className="rounded-lg bg-orange-100 p-3 text-center">
                      <p className="text-xs text-gray-500">Power</p>
                      <p className="font-medium">{drop.power || "0"}</p>
                    </div>
                  </div>
                  
                  {mintStatus === MintStatus.SUCCESS ? (
                    <div className="flex w-full flex-col items-center rounded-lg bg-green-50 p-4">
                      <CheckCircle className="mb-2 h-8 w-8 text-green-500" />
                      <p className="mb-1 font-medium text-green-700">Successfully Minted!</p>
                      {mintTransaction && (
                        <a 
                          href={`https://photon.helius.dev/tx/${mintTransaction}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                        >
                          View Transaction <ExternalLink size={14} />
                        </a>
                      )}
                      <Link 
                        href={mintedTokenId ? `/drops/${dropId}` : "/gallery"}
                        className="mt-4 rounded-lg bg-black px-6 py-2 font-garamond italic text-white"
                      >
                        View Drop
                      </Link>
                    </div>
                  ) : mintStatus === MintStatus.ERROR ? (
                    <div className="flex w-full flex-col items-center rounded-lg bg-red-50 p-4">
                      <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
                      <p className="mb-1 font-medium text-red-700">Minting Failed</p>
                      <p className="mb-3 text-center text-sm text-red-600">{error}</p>
                      {error?.includes("credits") ? (
                        <Link
                          href="/buy-credits" 
                          className="mt-2 rounded-lg bg-green-600 px-4 py-2 font-garamond italic text-white hover:bg-green-700"
                        >
                          Purchase Credits
                        </Link>
                      ) : (
                        <Button
                          onClick={handleMint}
                          className="mt-2 bg-black font-garamond italic text-white hover:bg-black/80"
                        >
                          Try Again
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={handleMint}
                      disabled={mintStatus === MintStatus.LOADING || !isAuthenticated}
                      className="w-full bg-black font-garamond italic text-white hover:bg-black/80 disabled:bg-gray-400"
                    >
                      {mintStatus === MintStatus.LOADING ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Minting...
                        </span>
                      ) : !isAuthenticated ? (
                        "Connect Wallet to Mint"
                      ) : (
                        "Mint Token"
                      )}
                    </Button>
                  )}
                  
                  {!isAuthenticated && (
                    <p className="mt-3 text-center text-xs text-gray-500">
                      You need to connect your wallet to mint this token
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* QR Code for sharing */}
            <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md lg:flex-1 lg:max-w-xs">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-white p-6">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Share2 size={16} />
                  Share this mint link
                </div>
                <QRCodeComponent 
                  url={typeof window !== 'undefined' ? window.location.href : `https://twinn.io/mint/${dropId}`}
                  size={180}
                  title="Scan to mint"
                  description="Share this QR code to let others mint this drop"
                  logoUrl={drop?.image || "https://via.placeholder.com/50"}
                />
                <p className="mt-4 text-center text-sm text-gray-600">
                  Share this QR code to let others mint this drop
                </p>
              </div>
            </div>
          </div>
        </div>
      </GridWrapper>
    </div>
  );
} 