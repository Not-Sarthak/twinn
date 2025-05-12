"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GridWrapper } from "../../components/ui/grid-wrapper";
import { AnimatedText } from "../../components/ui/animated-text";
import { Collection, Drop } from "../../lib/types";
import { ArrowLeft, CheckCircle, Images, Users } from "lucide-react";
import Image from "next/image";
import { GalleryCard } from "../../components/cards/gallery-card";
import { CollectionsDummyData, POAPDummyData } from "../../lib/data";

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionDrops, setCollectionDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundCollection = CollectionsDummyData.find((item) => item.id === id);

    if (foundCollection) {
      setCollection(foundCollection);

      const drops = POAPDummyData.filter((drop) => drop.collectionId === id);
      setCollectionDrops(drops);
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-lg text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="text-lg text-text-secondary">Collection Not Found</div>
        <Link href="/collections" className="">
          <ArrowLeft size={16} />
          Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Link href="/collections" className="flex items-center gap-2 px-4">
        <ArrowLeft size={16} />
        <span>Back to Collections</span>
      </Link>
      <section className="pt-4 px-4">
        <div className="relative h-[250px] w-full overflow-hidden rounded-t-xl md:h-[300px]">
          <Image
            src={collection.coverImage || "/images/cover-dummy.png"}
            alt={`${collection.name} cover`}
            className="h-full w-full object-cover"
            width={1920}
            height={300}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        </div>

        <GridWrapper>
          <div className="px-6 py-8 md:px-10">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-shrink-0">
                <div className="relative -mt-20 h-40 w-40 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg md:h-48 md:w-48">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover"
                    width={192}
                    height={192}
                  />
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-medium tracking-wide font-garamond italic text-text-primary md:text-4xl">
                    {collection.name}
                  </div>
                </div>

                <div className="mt-2 text-text-secondary">
                  Created by{" "}
                  <span className="font-medium italic font-garamond text-orange-500 underline">
                    {collection.creator}
                  </span>{" "}
                  on {collection.createdAt}
                </div>

                <div className="mt-2 whitespace-pre-line text-text-secondary">
                  {collection.description}
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center text-orange-500 gap-2 rounded-md border-[1px] border-dashed border-orange-500 bg-orange-100 px-4 py-2 shadow-sm">
                    <Images size={16} />
                    <div className="">
                      {collectionDrops.length}
                    </div>
                    <div className="">Drop(s)</div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border-[1px] text-[#309898] border-dashed border-[#309898] bg-[#309898]/10 px-2 py-0.5">
                    <Users size={16} />
                    <div className="">
                      {collection.collectorsCount.toLocaleString()}
                    </div>
                    <div className="">Collectors</div>
                  </div>
                </div>
              </div>
            </div>

          <GridWrapper>
            <div className="mt-8">
              <h2 className="mb-8 font-garamond text-2xl italic tracking-wide text-text-primary">
                Drops in this Collection
              </h2>

              {collectionDrops.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
                  {collectionDrops.map((drop) => (
                    <GalleryCard key={drop.id} {...drop} />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl border border-border-primary/50 bg-white/50 backdrop-blur-sm">
                  <p className="text-text-secondary">
                    No drops in this collection yet
                  </p>
                </div>
              )}
            </div>
            </GridWrapper>
          </div>
        </GridWrapper>
      </section>
    </div>
  );
}
