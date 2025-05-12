"use client";

import { useEffect, useState, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/app/lib/utils";
import { Input } from "@/app/components/ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { getWalletAddress } from "@/app/lib/payment-services/payment";
import { shortenAddress } from "@/app/lib/utils";
import WrapButton from "../buttons/wrap-button";

type WrapperStyle = MotionStyle & {
  "--x": MotionValue<string>;
  "--y": MotionValue<string>;
};

interface PurchaseDetailsProps {
  balance: number | null;
  balanceLoading: boolean;
  credits: number;
  amount: number;
  setAmount: (amount: number) => void;
  isProcessing: boolean;
  children?: React.ReactNode;
}

function FeatureCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue("0%");
  const mouseY = useMotionValue("0%");

  const handleMouseMove = ({ clientX, clientY, currentTarget }: MouseEvent) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width;
    const y = (clientY - top) / height;
    mouseX.set(`${x * 100}%`);
    mouseY.set(`${y * 100}%`);
  };

  const style = {
    "--x": mouseX,
    "--y": mouseY,
  } as WrapperStyle;

  return (
    <motion.div
      className={cn(
        "animated-cards group relative w-full cursor-pointer rounded-[16px]",
        className,
      )}
      onMouseMove={handleMouseMove}
      style={style}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-orange-100/40 bg-white shadow-sm transition duration-300",
          "before:absolute before:inset-0 before:h-full before:w-full before:bg-[radial-gradient(800px_circle_at_var(--x)_var(--y),rgba(255,237,213,0.15),transparent_40%)] before:opacity-0 before:transition-opacity before:duration-500 md:hover:border-orange-200/70 md:hover:shadow-md md:hover:before:opacity-100",
        )}
      >
        <div className="w-full">{children}</div>
      </div>
    </motion.div>
  );
}

export function SkiperCard({
  balance,
  balanceLoading,
  credits,
  amount,
  setAmount,
  isProcessing,
  children,
}: PurchaseDetailsProps) {
  const { user } = usePrivy();
  const walletAddress = getWalletAddress(user);
  const [inputValue, setInputValue] = useState(amount.toString());
  const [solAmount, setSolAmount] = useState((amount / 100).toFixed(2));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      setAmount(0);
      setSolAmount("0.00");
    } else {
      const creditsValue = parseFloat(value) || 0;
      setAmount(creditsValue);
      setSolAmount((creditsValue / 100).toFixed(2));
    }
  };

  return (
    <FeatureCard>
      <div className="flex flex-col space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <WrapButton
            copyValue={walletAddress}
            showBalance={!balanceLoading}
            balance={balance}
            walletAddress={walletAddress}
            className="w-full sm:w-auto"
          >
            {walletAddress ? shortenAddress(walletAddress) : "Connect Wallet"}
          </WrapButton>
          <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border-[1px] border-dashed border-orange-500 bg-orange-100 px-3 py-1.5">
                <p className="flex items-baseline text-base font-semibold text-gray-800 sm:text-lg">
                  <span>{credits}</span>
                  <span className="ml-1 text-xs font-medium text-gray-500 sm:text-sm">
                    Credits
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="amount"
            className="flex items-center justify-between text-sm font-medium text-gray-700"
          >
            <span>Credits to Purchase</span>
            <span className="text-sm text-gray-500">≈ {solAmount} SOL</span>
          </label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              min="0"
              step="1"
              value={inputValue}
              onChange={handleInputChange}
              disabled={isProcessing}
              className="h-10 rounded-lg border-gray-200 bg-gray-50 pr-12 text-sm shadow-sm transition [appearance:textfield] focus:border-orange-500 focus:bg-white focus:ring-[1px] focus:ring-orange-500 disabled:opacity-70 sm:h-12 sm:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 sm:text-sm">
              Credits
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 text-xs text-text-secondary sm:text-sm">
            Quote: 1 SOL = 100 Credits
          </div>
        </div>

        {children}
      </div>
    </FeatureCard>
  );
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isSmall = window.matchMedia("(max-width: 768px)").matches;
    const isMobile = Boolean(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.exec(
        userAgent,
      ),
    );

    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) setIsMobile(isSmall || isMobile);

    setIsMobile(isSmall && isMobile);
  }, []);

  return isMobile;
}
