"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GridWrapper } from "../../components/ui/grid-wrapper";
import { AnimatedText } from "../../components/ui/animated-text";
import { Collection, Drop } from "../../lib/types";
import { ArrowLeft, CheckCircle, Images, Users, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { GalleryCard } from "../../components/cards/gallery-card";
import { getCollectionById } from "../../lib/services/collection.service";

export default function CollectionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionDrops, setCollectionDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollectionData() {
      try {
        setLoading(true);
        const response = await getCollectionById(id);
        
        if (response && response.collection) {
          setCollection(response.collection);
          
          if (response.drops && Array.isArray(response.drops)) {
            setCollectionDrops(response.drops);
          }
        } else {
          setError("Collection not found");
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError("Failed to load collection");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCollectionData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!collection || error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="text-lg text-text-secondary">Collection Not Found</div>
        <Link 
          href="/collections" 
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          <span>Back to Collections</span>
        </Link>
      </div>
    );
  }

  // Format creator info
  const creatorName = collection.creator?.name || "Unknown Creator";
  const createdAt = collection.createdAt 
    ? new Date(collection.createdAt).toLocaleDateString() 
    : "Unknown date";

  // Get collector count
  const collectorsCount = collection.numberOfTotalMintsInCollection || 0;

  return (
    <div className="mt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link 
          href="/collections" 
          className="mb-4 flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          <span>Back to Collections</span>
        </Link>
      </div>
      
      <section className="pt-4">
        <div className="relative h-[250px] w-full overflow-hidden md:h-[300px]">
          <Image
            src={collection.coverImage || collection.logo || "/images/cover-dummy.png"}
            alt={`${collection.name} cover`}
            className="h-full w-full object-cover"
            width={1920}
            height={300}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="px-0 py-8 md:px-4">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-shrink-0">
                <div className="relative -mt-20 h-40 w-40 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg md:h-48 md:w-48">
                  <Image
                    src={collection.logo || collection.image || "/images/placeholder.png"}
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
                  {collection.isVerified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                </div>

                <div className="mt-2 text-text-secondary">
                  Created by{" "}
                  <span className="font-medium italic font-garamond text-orange-500">
                    {creatorName}
                  </span>{" "}
                  on {createdAt}
                </div>

                <div className="mt-2 whitespace-pre-line text-text-secondary">
                  {collection.description || "No description available"}
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center text-orange-500 gap-2 rounded-md border-[1px] border-dashed border-orange-500 bg-orange-100 px-4 py-2 shadow-sm">
                    <Images size={16} />
                    <div className="">
                      {collection.numberOfDropsInCollection || collectionDrops.length || 0}
                    </div>
                    <div className="">Drop(s)</div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border-[1px] text-[#309898] border-dashed border-[#309898] bg-[#309898]/10 px-4 py-2">
                    <Users size={16} />
                    <div className="">
                      {collectorsCount.toLocaleString()}
                    </div>
                    <div className="">Collectors</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="mb-8 font-garamond text-2xl italic tracking-wide text-text-primary">
                Drops in this Collection
              </h2>

              {collectionDrops.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
          </div>
        </div>
      </section>
    </div>
  );
}
