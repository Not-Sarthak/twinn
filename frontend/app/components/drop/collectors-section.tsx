"use client";

import React, { useState } from "react";
import { Drop } from "../../lib/types";
import { AnimatedTabs } from "../ui/animated-tabs";
import { GridWrapper } from "../ui/grid-wrapper";
import { Download, Users, Grid, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { CollectionCard } from "../cards/collection-card";
import Link from "next/link";
import { CollectorsTable } from "../tables/collectors-table";

interface CollectionInfo {
  id: string;
  name: string;
  image: string;
  coverImage: string;
  type?: string;
}

interface EnhancedDrop extends Drop {
  collectionInfo?: CollectionInfo;
}

interface CollectorsSectionProps {
  drop: EnhancedDrop;
}

export function CollectorsSection({ drop }: CollectorsSectionProps) {
  const [activeTab, setActiveTab] = useState(
    drop.collectionInfo ? "Collections" : "Collectors",
  );

  const hasCollectors = drop.collectors && drop.collectors.length > 0;
  const hasCollection = !!drop.collectionInfo;
  const hasMoments = drop.moments && drop.moments > 0;

  if (!hasCollectors && !hasCollection && !hasMoments) {
    return null;
  }

  const tabs = [
    ...(hasCollectors ? [{ label: "Collectors", icon: Users }] : []),
    ...(hasCollection ? [{ label: "Collections", icon: Grid }] : []),
    ...(hasMoments ? [{ label: "Moments", icon: Clock }] : []),
  ];

  const tabHeaderContent = (
    <div className="flex items-center justify-end py-4">
      {activeTab === "Collectors" && (
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          Download CSV
        </Button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Collectors":
        return (
          <div className="mt-6">
            {drop.collectors && (
              <CollectorsTable collectors={drop.collectors} />
            )}
          </div>
        );
      case "Collections":
        if (drop.collectionInfo) {
          return (
            <div className="mt-6">
              <div className="max-w-md">
                <Link href={`/collections/${drop.collectionInfo.id}`}>
                  <CollectionCard
                    id={drop.collectionInfo.id}
                    name={drop.collectionInfo.name}
                    coverImage={drop.collectionInfo.coverImage}
                    image={drop.collectionInfo.image}
                    type={drop.collectionInfo.type}
                    description=""
                    creator=""
                    dropCount={0}
                    collectorsCount={0}
                    isVerified={false}
                    createdAt=""
                  />
                </Link>
              </div>
            </div>
          );
        }
        return (
          <div className="py-8 text-center text-text-secondary">
            This Drop is Not Part of Any Collection.
          </div>
        );
      case "Moments":
        return (
          <div className="py-8 text-center">
            <p className="mt-2 text-text-secondary">Coming Soon!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-12">
      <GridWrapper>
        <div className="space-y-4 px-10">
          {tabHeaderContent}

          <AnimatedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {renderContent()}
        </div>
      </GridWrapper>
    </div>
  );
}
