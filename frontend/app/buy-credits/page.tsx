"use client";

import { useState } from "react";
import { useBalance } from "../lib/hooks/use-balance";
import { useCreditsStore } from "../lib/hooks/use-credits-store";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import TransactionsHistory from "../components/tables/buy-credits-transactions";
import { getWalletAddress } from "../lib/payment-services/payment";
import { processWalletPayment } from "../lib/payment-services/payment-service";
import { StatusMessage } from "../components/buy-credits/status";
import { CryptoPaymentForm } from "../components/buy-credits/crypto-payment-form";
import { SkiperCard } from "../components/cards/skiper-card";

export default function BuyCreditsPage() {
  // Payment state
  const [amount, setAmount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const solAmount = (amount / 100).toFixed(4);

  // Hooks
  const { balance, loading: balanceLoading, fetchBalance } = useBalance();
  const { credits, addCredits } = useCreditsStore();
  const { user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  const handleSuccess = (txHash: string) => {
    setCurrentTxHash(txHash);
    addCredits(amount, txHash);
    setStatusMessage("Transaction successful! Credits added to your account.");
    setIsError(false);

    const address = getWalletAddress(user);
    if (address) {
      setTimeout(() => {
        fetchBalance(address);
      }, 2000);
    }
  };

  const handleError = (error: string) => {
    setStatusMessage(`Transaction failed: ${error}`);
    setIsError(true);
  };

  const handleCryptoPayment = async (e: React.FormEvent) => {
    console.log("handleCryptoPayment");
    e.preventDefault();

    if (!amount || amount <= 0) {
      setStatusMessage("Please Enter a Valid Amount");
      setIsError(true);
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Processing your Transaction");
    setIsError(false);
    setCurrentTxHash(null);

    const wallet =
      solanaWallets && solanaWallets.length > 0 ? solanaWallets[0] : null;

    // Convert credits to SOL (1 SOL = 100 credits)
    const solToSend = parseFloat((amount / 100).toFixed(6));
    console.log("Credits:", amount, "SOL amount:", solToSend);

    const result = await processWalletPayment(wallet, solToSend);

    if (result.success && result.txHash) {
      handleSuccess(result.txHash);
    } else {
      handleError(result.error || "Unknown error");
    }

    setIsProcessing(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <h1 className="mx-auto mb-6 max-w-2xl text-center font-garamond text-3xl font-medium italic text-text-primary sm:text-4xl md:mb-8 md:text-5xl lg:text-6xl lg:leading-[64px]">
        Buy Credits
      </h1>

      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
          <div className="relative z-10 w-full rounded-xl bg-white sm:rounded-2xl">
            <SkiperCard
              balance={balance}
              balanceLoading={balanceLoading}
              credits={credits}
              amount={amount}
              setAmount={setAmount}
              isProcessing={isProcessing}
            >
              <div className="z-50 mt-6 sm:mt-8">
                <CryptoPaymentForm
                  isProcessing={isProcessing}
                  solanaWallets={solanaWallets}
                  onSubmit={handleCryptoPayment}
                  solAmount={solAmount}
                />
              </div>
            </SkiperCard>
          </div>
        </section>

        <div className="space-y-3 sm:space-y-4">
          <StatusMessage
            message={statusMessage}
            isError={isError}
            txHash={currentTxHash || undefined}
          />
        </div>

        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
          <div className="relative z-10 w-full rounded-xl bg-white p-4 sm:rounded-2xl sm:p-6">
            <TransactionsHistory />
          </div>
        </section>
      </div>
    </div>
  );
}
