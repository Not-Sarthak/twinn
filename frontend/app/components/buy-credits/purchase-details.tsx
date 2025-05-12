"use client";

import { SkiperCard } from "@/app/components/cards/skiper-card";

interface PurchaseDetailsProps {
  balance: number | null;
  balanceLoading: boolean;
  credits: number;
  conversionRate: number;
  amount: number;
  setAmount: (amount: number) => void;
  isProcessing: boolean;
  creditsToReceive: number;
}

export function PurchaseDetails({
  balance,
  balanceLoading,
  credits,
  conversionRate,
  amount,
  setAmount,
  isProcessing,
  creditsToReceive,
}: PurchaseDetailsProps) {
  return (
    <section className="relative my-14 w-full overflow-hidden" id="features">
      <div className="p-2">
        <div className="mx-auto mb-8 pt-4 md:container">
          <div className="mx-auto">
            <div className="mx-auto max-w-4xl rounded-[34px] bg-orange-100">
              <div className="relative z-10 grid w-full gap-8 rounded-[28px] bg-white p-2">
                <SkiperCard
                  balance={balance}
                  balanceLoading={balanceLoading}
                  credits={credits}
                  amount={amount}
                  setAmount={setAmount}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
