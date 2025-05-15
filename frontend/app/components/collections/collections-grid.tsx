"use client";

import React from "react";
import { CollectionCard } from "../cards/collection-card";
import { Collection } from "../../lib/types";
import { ShimmerCard } from "../ui/shimmer";

interface CollectionsGridProps {
  collections: Collection[];
  isLoading?: boolean;
}

interface CollectionsGridItemProps {
  collection: Collection;
}

const CollectionsGridItem = ({ collection }: CollectionsGridItemProps) => {
  return <CollectionCard {...collection} />;
};

export const CollectionsGrid = ({
  collections,
  isLoading = false,
}: CollectionsGridProps) => {
  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <ShimmerCard key={`shimmer-${index}`} />
          ))}
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="col-span-full py-16 text-center text-text-secondary">
        No results found. Try a different search term.
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} {...collection} />
      ))}
    </div>
  );
};

// Add Item as a static property to CollectionsGrid
CollectionsGrid.Item = CollectionsGridItem;
