import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CollectionFormValues } from "../validations/collection-schema";

export type CollectionFormData = CollectionFormValues;

interface CreateCollectionState {
  formData: CollectionFormData;
  isSubmitting: boolean;
  updateFormData: (data: Partial<CollectionFormData>) => void;
  addDropToCollection: (dropId: string) => void;
  removeDropFromCollection: (dropId: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

const initialFormData: CollectionFormData = {
  title: "",
  type: "",
  creator: "",
  description: "",
  link: "",
  coverImage: null,
  logoImage: null,
  drops: [],
};

export const useCreateCollectionStore = create<CreateCollectionState>()(
  persist(
    (set) => ({
      formData: initialFormData,
      isSubmitting: false,
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      addDropToCollection: (dropId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            drops: [...state.formData.drops, dropId],
          },
        })),
      removeDropFromCollection: (dropId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            drops: state.formData.drops.filter((id) => id !== dropId),
          },
        })),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      reset: () => set({ formData: initialFormData, isSubmitting: false }),
    }),
    {
      name: "create-collection-store",
    },
  ),
);
