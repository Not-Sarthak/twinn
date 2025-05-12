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
  name,
  description,
  dropCount,
  collectorsCount,
}: CollectionCardProps) => {
  return (
    <Link href={`/collections/${id}`} className="block no-underline">
      <MinimalCard className="min-h-[360px] ">
        <MinimalCardImage src={image} alt={name} />
        <MinimalCardContent>
          <div className="mb-2">
            <MinimalCardTitle>{name}</MinimalCardTitle>
          </div>
          <MinimalCardDescription className="line-clamp-2">
            {description}
          </MinimalCardDescription>
        </MinimalCardContent>
        <MinimalCardFooter className="flex justify-between mt-2 text-sm text-neutral-500">
          <div>
            <span className="font-medium text-neutral-700">{dropCount}</span>{" "}
            drops
          </div>
          <div>
            <span className="font-medium text-neutral-700">
              {collectorsCount.toLocaleString()}
            </span>{" "}
            Collectors
          </div>
        </MinimalCardFooter>
      </MinimalCard>
    </Link>
  );
};

export { CollectionCard };
