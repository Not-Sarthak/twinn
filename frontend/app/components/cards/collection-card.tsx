"use client";

import React from "react";
import Link from "next/link";
import { Collection } from "../../lib/types";
import {
  MinimalCard,
  MinimalCardImage,
  MinimalCardTitle,
  MinimalCardDescription,
  MinimalCardContent,
  MinimalCardFooter,
} from "../ui/minimal-card";

type CollectionCardProps = Collection;

const CollectionCard = ({
  id,
  coverImage,
  image,
  logo,
  name,
  description,
  dropCount,
  collectorsCount,
  numberOfDropsInCollection,
  numberOfTotalMintsInCollection,
}: CollectionCardProps) => {
  // Use the appropriate fields or fallbacks
  const displayImage = logo || image || coverImage || "https://via.placeholder.com/400";
  const displayDrops = numberOfDropsInCollection || dropCount || 0;
  const displayCollectors = numberOfTotalMintsInCollection || collectorsCount || 0;
  
  return (
    <Link href={`/collections/${id}`} className="block no-underline">
      <MinimalCard className="min-h-[360px] ">
        <MinimalCardImage src={displayImage} alt={name} />
        <MinimalCardContent>
          <div className="mb-2">
            <MinimalCardTitle>{name}</MinimalCardTitle>
          </div>
          <MinimalCardDescription className="line-clamp-2">
            {description || "No description available"}
          </MinimalCardDescription>
        </MinimalCardContent>
        <MinimalCardFooter className="flex justify-between mt-2 text-sm text-neutral-500">
          <div>
            <span className="font-medium text-neutral-700">{displayDrops}</span>{" "}
            drops
          </div>
          <div>
            <span className="font-medium text-neutral-700">
              {displayCollectors.toLocaleString()}
            </span>{" "}
            Collectors
          </div>
        </MinimalCardFooter>
      </MinimalCard>
    </Link>
  );
};

export { CollectionCard };
