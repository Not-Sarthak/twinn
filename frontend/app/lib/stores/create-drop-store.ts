import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DateRange } from "react-day-picker";
import { CompressedNFTResponse } from "../validations/drop-schema";

export type DropFormData = {
  title: string;
  description: string;
  website?: string;
  dateRange?: DateRange;
  startDate: Date | null;
  endDate: Date | null;
  attendees: number;
  artwork?: File | null;
  ipfsHash?: string | null;
  // NFT-specific fields
  symbol?: string;
  recipientAddress?: string;
  createNFT?: boolean;
  nftResponse?: CompressedNFTResponse | null;
};

interface CreateDropState {
  formData: DropFormData;
  step: number;
  isSubmitting: boolean;
  updateFormData: (data: Partial<DropFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

const initialFormData: DropFormData = {
  title: "",
  description: "",
  website: "",
  dateRange: undefined,
  startDate: null,
  endDate: null,
  attendees: 0,
  artwork: null,
  ipfsHash: null,
  symbol: "",
  recipientAddress: "",
  createNFT: false,
  nftResponse: null,
};

export const useCreateDropStore = create<CreateDropState>()(
  persist(
    (set) => ({
      formData: initialFormData,
      step: 0,
      isSubmitting: false,
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
      setStep: (step) => set({ step }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      reset: () =>
        set({ formData: initialFormData, step: 0, isSubmitting: false }),
    }),
    {
      name: "create-drop-store",
    },
  ),
);
