import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CreditsState {
  credits: number;
  conversionRate: number; // 100 credits per $1
  transactions: {
    amount: number;
    txHash: string;
    credits: number;
    timestamp: Date;
  }[];
  addCredits: (amount: number, txHash: string) => void;
  useCredits: (amount: number) => boolean;
}

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      credits: 0,
      conversionRate: 100,
      transactions: [],
      addCredits: (amount: number, txHash: string) => {
        const creditsToAdd = amount * get().conversionRate;

        set((state) => {
          const newState = {
            credits: state.credits + creditsToAdd,
            transactions: [
              ...state.transactions,
              {
                amount,
                txHash,
                credits: creditsToAdd,
                timestamp: new Date(),
              },
            ],
          };
          return newState;
        });
      },
      useCredits: (amount: number) => {
        const { credits } = get();

        if (credits < amount) {
          return false;
        }

        set((state) => {
          const newCredits = state.credits - amount;
          return {
            credits: newCredits,
          };
        });
        return true;
      },
    }),
    {
      name: "credits-storage",
    },
  ),
);
