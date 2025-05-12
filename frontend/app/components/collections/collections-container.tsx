"use client";

import React, { useState, useMemo } from "react";
import { CollectionsGrid } from "./collections-grid";
import { Collection } from "../../lib/types";

interface CollectionsContainerProps {
  collections: Collection[];
  searchTerm: string;
  activeTab: string;
  isLoading?: boolean;
}

export const CollectionsContainer = ({
  collections,
  searchTerm,
  activeTab,
  isLoading = false,
}: CollectionsContainerProps) => {
  const filteredCollections = useMemo(() => {
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
  }, [collections, searchTerm]);

  const renderContent = () => {
    const itemsToRender = filteredCollections;

    switch (activeTab) {
      case "Featured":
        return (
          <CollectionsGrid
            collections={itemsToRender.filter((item) => item.isVerified)}
            isLoading={isLoading}
          />
        );
      case "All":
        return (
          <CollectionsGrid collections={itemsToRender} isLoading={isLoading} />
        );
      case "Organizations":
        return (
          <div className="flex items-center justify-center py-16">
            <p className="text-lg text-text-secondary">
              Organization Collections
            </p>
          </div>
        );
      case "Artists":
        return (
          <div className="flex items-center justify-center py-16">
            <p className="text-lg text-text-secondary">Artist Collections</p>
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};
