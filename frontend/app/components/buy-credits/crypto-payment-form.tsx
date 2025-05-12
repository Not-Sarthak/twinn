import { LoadingSpinner } from "./spinner";
import { cn } from "@/app/lib/utils";

interface CryptoPaymentFormProps {
  isProcessing: boolean;
  solanaWallets: any[] | undefined;
  onSubmit: (e: React.FormEvent) => void;
  solAmount: string;
}

export function CryptoPaymentForm({
  isProcessing,
  solanaWallets,
  onSubmit,
  solAmount,
}: CryptoPaymentFormProps) {
  const showWalletWarning = !solanaWallets || solanaWallets.length === 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <button
        type="submit"
        className={cn(
          "z-20 w-full rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-2 text-white hover:from-orange-600 hover:to-orange-700",
        )}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            <span>Processing Transaction</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Pay {solAmount} SOL
          </span>
        )}
      </button>

      {showWalletWarning && (
        <p className="text-center text-sm text-red-500">
          Please Connect a Solana Wallet to Continue
        </p>
      )}
    </form>
  );
}
