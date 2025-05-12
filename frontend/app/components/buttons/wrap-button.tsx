import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe, Check, Copy } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface WrapButtonProps {
  className?: string;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  copyValue?: string;
  showBalance?: boolean;
  balance?: number | null;
  walletAddress?: string;
}

const WrapButton: React.FC<WrapButtonProps> = ({
  className,
  children,
  href,
  onClick,
  copyValue,
  showBalance,
  balance,
  walletAddress,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!copyValue) return;

    navigator.clipboard
      .writeText(copyValue)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="flex items-center justify-center">
      {href ? (
        <Link href={href}>
          <div
            className={cn(
              "group flex cursor-pointer items-center gap-2 rounded-full border border-[#3B3A3A] bg-[#151515] p-[11px]",
              className,
            )}
            onClick={onClick}
          >
            <div className="flex h-[43px] items-center justify-center rounded-full border border-[#3B3A3A] bg-[#ff3f17] text-white">
              <p className="ml-2 mr-3 flex items-center justify-center gap-2 font-medium tracking-tight">
                {children}
              </p>
            </div>
            <div className="flex size-[26px] items-center justify-center rounded-full border-2 border-[#3b3a3a] text-[#3b3a3a] transition-all ease-in-out group-hover:ml-2">
              <ArrowRight
                size={18}
                className="transition-all ease-in-out group-hover:rotate-45"
              />
            </div>
          </div>
        </Link>
      ) : (
        <div
          className={cn(
            "group flex cursor-pointer items-center gap-2 rounded-full border border-[#3B3A3A] bg-[#151515] pr-[11px]",
            className,
          )}
          onClick={onClick}
        >
          <div
            onClick={handleCopy}
            className="flex h-[40px] items-center justify-center rounded-full border border-[#3B3A3A] bg-[#fe7500] text-white"
          >
            <Globe className="mx-2 h-4 w-4 animate-spin" />
            <p className="mr-3 flex items-center text-sm tracking-tight">
              {children ? children : "Get Started"}
              {copyValue && (
                <button className="z-20 ml-2 flex items-center justify-center">
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </p>
          </div>

          {showBalance && balance !== null && (
            <div className="mr-2 text-sm font-medium text-[#c4c4c4]">
              {balance?.toFixed(4)} SOL
            </div>
          )}
          <Link href={`https://explorer.solana.com/address/${walletAddress}`}>
            <button className="flex size-[26px] items-center justify-center rounded-full border-2 border-[#3b3a3a] text-[#3b3a3a] transition-all ease-in-out group-hover:ml-2">
              <ArrowRight
                size={18}
                className="transition-all ease-in-out group-hover:rotate-45"
              />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WrapButton;
