"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { GridWrapper } from "../../components/ui/grid-wrapper";
import { AnimatedText } from "../../components/ui/animated-text";
import { CollectionsDummyData, POAPDummyData } from "../../lib/data";
import { Collection, Drop } from "../../lib/types";
import Link from "next/link";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { CollectorsSection } from "../../components/drop/collectors-section";
import { Tilt } from "../../components/ui/tilt";
import { CollectionCard } from "../../components/cards/collection-card";

export default function DropDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const collectionIdFromParams = searchParams.get("collectionId");

  const [drop, setDrop] = useState<Drop | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundDrop = POAPDummyData.find((item) => item.id === id);
    setDrop(foundDrop || null);

    if (foundDrop) {
      const collectionId = foundDrop.collectionId || collectionIdFromParams;

      if (collectionId) {
        const foundCollection = CollectionsDummyData.find(
          (item) => item.id === collectionId,
        );
        setCollection(foundCollection || null);
      }
    }

    setLoading(false);
  }, [id, collectionIdFromParams]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-lg text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="text-lg text-text-secondary">Drop Not Found</div>
        <Link
          href="/gallery"
          className="bg-primary flex items-center gap-2 rounded-lg px-4 py-2 text-white"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>
      </div>
    );
  }

  const collectionId = drop.collectionId || collectionIdFromParams;
  const backLink = collectionId ? `/collections/${collectionId}` : "/gallery";
  const backText = collection
    ? `Back to ${collection.name}`
    : "Back to Gallery";

  const enhancedDrop = {
    ...drop,
    collectionInfo: collection
      ? {
          id: collection.id,
          name: collection.name,
          image: collection.image,
          type: collection.type,
          coverImage: collection.coverImage || collection.image,
        }
      : undefined,
  };

  return (
    <div className="mt-6 space-y-10 md:space-y-16">
      <section>
        <GridWrapper>
          <div className="relative px-10 py-4">
            <Link
              href={backLink}
              className="mb-8 flex w-fit items-center gap-2 rounded-lg border-[1px] border-dashed border-orange-500 bg-orange-100 px-2 py-0.5 text-sm text-orange-500 hover:text-text-primary"
            >
              <ArrowLeft size={16} />
              <span>{backText}</span>
            </Link>

            <div className="mt-4 flex flex-col gap-8 md:flex-row">
              <Tilt
                className="h-fit flex-shrink-0 rounded-xl border-[1px] border-dashed border-orange-500 bg-orange-100 p-4"
                rotationFactor={8}
                springOptions={{ stiffness: 300, damping: 20 }}
              >
                <div className="relative h-64 w-64 overflow-hidden rounded-xl border-4 border-white shadow-xl">
                  <div className="absolute inset-0 z-10 bg-gradient-to-tr from-orange-400/10 to-pink-300/10"></div>
                  <Image
                    src={drop.image}
                    alt={drop.title}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Tilt>

              <div className="flex-grow">
                <div className="">
                  <AnimatedText className="text-sm text-text-secondary">
                    DROP ID: <span className="font-semibold">#{drop.id}</span>
                  </AnimatedText>
                </div>
                <AnimatedText
                  as="h1"
                  delay={0}
                  className="pt-2 text-3xl font-medium leading-tight tracking-tighter text-text-primary md:text-4xl"
                >
                  {drop.title}
                </AnimatedText>

                <AnimatedText className="flex items-center gap-2 text-sm text-text-secondary">
                  <Calendar size={16} />
                  {drop.date}
                </AnimatedText>

                {collection && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="rounded-lg border-[1px] border-dashed border-[#81E7AF] bg-[#81E7AF]/10 px-2 py-1">
                      <div className="text-sm font-medium text-slate-700">
                        Collection:
                        <Link
                          href={`/collections/${collectionId}`}
                          className="ml-1 text-[#309898] hover:underline"
                        >
                          {collection.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 whitespace-pre-line text-text-secondary">
                  {drop.description}
                </div>

                {drop.artistInfo && (
                  <div className="mt-6 flex w-fit items-center gap-2 rounded-lg border-[1px] border-dashed border-orange-500 bg-orange-100 px-2 py-0.5">
                    <div className="text-sm text-text-secondary">
                      Artist: {drop.artistInfo}
                    </div>
                  </div>
                )}

                {drop.externalLink && (
                  <Link
                    href={`https://${drop.externalLink}`}
                    target="_blank"
                    className="text-primary mt-4 flex items-center gap-1 text-sm text-orange-500 hover:underline"
                  >
                    {drop.externalLink} <ExternalLink size={14} />
                  </Link>
                )}

                <div className="mt-8 flex flex-wrap gap-6">
                  {drop.supply && (
                    <div className="flex items-center gap-2 rounded-lg border-[1px] border-dashed border-orange-500 bg-orange-100 px-2 py-0.5">
                      <div className="text-orange-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-database-icon lucide-database"
                        >
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                          <path d="M3 12A9 3 0 0 0 21 12" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">{drop.supply}</div>
                        <div className="text-xs text-text-secondary">
                          Supply
                        </div>
                      </div>
                    </div>
                  )}

                  {drop.power && (
                    <div className="flex items-center gap-2 rounded-lg border-[1px] border-dashed border-[#309898] bg-[#309898]/10 px-2 py-0.5">
                      <div className="text-[#309898]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-flame-icon lucide-flame"
                        >
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">{drop.power}</div>
                        <div className="text-xs text-text-secondary">Power</div>
                      </div>
                    </div>
                  )}

                  {collection && (
                    <div className="flex items-center gap-2 rounded-lg border-[1px] border-dashed border-[#81E7AF] bg-[#81E7AF]/10 px-2 py-0.5">
                      <div className="text-[#81E7AF]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-library-big-icon lucide-library-big"
                        >
                          <rect width="8" height="18" x="3" y="3" rx="1" />
                          <path d="M7 3v18" />
                          <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">
                          <Link
                            href={`/collections/${collection.id}`}
                            className="hover:underline"
                          >
                            {collection.name}
                          </Link>
                        </div>
                        <div className="text-xs text-text-secondary">
                          Collection
                        </div>
                      </div>
                    </div>
                  )}

                  {drop.transfers && (
                    <div className="flex items-center gap-2 rounded-lg border-[1px] border-dashed border-[#FFA725] bg-[#FFA725]/10 px-2 py-0.5">
                      <div className="text-[#FFA725]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m16 3 4 4-4 4" />
                          <path d="M20 7H4" />
                          <path d="m8 21-4-4 4-4" />
                          <path d="M4 17h16" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">
                          {drop.transfers}
                        </div>
                        <div className="text-xs text-text-secondary">
                          Transfers
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </GridWrapper>

        {(drop.collectors || collection) && (
          <CollectorsSection drop={enhancedDrop} />
        )}
      </section>
    </div>
  );
}
