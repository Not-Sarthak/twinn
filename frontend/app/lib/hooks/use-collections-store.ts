import { create } from "zustand";
import { CollectionsDummyData } from "../data";
import { Collection } from "../types";

interface CollectionsState {
  collections: Collection[];
  isLoading: boolean;

  searchTerm: string;
  activeTab: string;

  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: string) => void;
  setCollections: (collections: Collection[]) => void;
  setLoading: (isLoading: boolean) => void;

  getFilteredCollections: () => Collection[];
  getCollectionsByTab: (tab: string) => Collection[];
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  // Initial state
  collections: CollectionsDummyData,
  isLoading: false,
  searchTerm: "",
  activeTab: "Featured",

  // Actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCollections: (collections) => set({ collections }),
  setLoading: (isLoading) => set({ isLoading }),

  getFilteredCollections: () => {
    const { collections, searchTerm } = get();
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      return collections;
    }

    return collections.filter(
      (collection) =>
        collection.id.toLowerCase().includes(term) ||
        collection.name.toLowerCase().includes(term) ||
        collection.description.toLowerCase().includes(term),
    );
  },

  getCollectionsByTab: (tab) => {
    const filteredCollections = get().getFilteredCollections();

    switch (tab) {
      case "Featured":
        return filteredCollections.filter((item) => item.isVerified);
      case "All":
        return filteredCollections;
      case "Organizations":
        // Placeholder: In real implementation, filter by organization type
        return [];
      case "Artists":
        // Placeholder: In real implementation, filter by artist type
        return [];
      default:
        return filteredCollections;
    }
  },
}));
