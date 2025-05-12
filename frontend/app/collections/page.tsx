"use client";

import React, { useEffect } from "react";
import { GridWrapper } from "../components/ui/grid-wrapper";
import { AnimatedText } from "../components/ui/animated-text";
import { useAuthStatus } from "../lib/hooks/use-auth-status";
import { GrayButton } from "../components/buttons/gray-button";
import { CollectionsSearch } from "../components/collections/collections-search";
import { CollectionsTabs } from "../components/collections/collections-tabs";
import { CollectionsContainer } from "../components/collections/collections-container";
import { CollectionsGrid } from "../components/collections/collections-grid";
import { useCollectionsStore } from "../lib/hooks/use-collections-store";

export default function CollectionsPage() {
  const { isAuthenticated } = useAuthStatus();

  // Get state and actions from the collections store
  const {
    searchTerm,
    activeTab,
    isLoading,
    collections,
    setSearchTerm,
    setActiveTab,
    setLoading,
    getCollectionsByTab,
  } = useCollectionsStore();

  // Simulating API loading when search input changes
  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setLoading(false);
  }, [searchTerm, setLoading]);

  const filteredCollections = getCollectionsByTab(activeTab);

  return (
    <div className="mt-6 space-y-10 md:space-y-16">
      <section>
        <GridWrapper>
          <div className="relative text-balance px-6 py-8 md:px-10">
            {isAuthenticated && (
              <div className="absolute right-4 top-4 hidden items-center gap-2 md:flex">
                <GrayButton
                  text="Create Collection"
                  href="/create-collection"
                />
                {/* <GrayButton
                  text="Manage Collections"
                  href="/manage-collection"
                /> */}
              </div>
            )}

            <AnimatedText
              as="h1"
              delay={0}
              className="mx-auto max-w-2xl text-center font-garamond text-4xl font-medium italic text-text-primary md:text-6xl md:leading-[64px]"
            >
              Twinn Collections
            </AnimatedText>

            {isAuthenticated && (
              <div className="mt-4 flex justify-center gap-2 md:hidden">
                <GrayButton
                  text="Create Collection"
                  href="/create-collection"
                />
                {/* <GrayButton
                  text="Manage Collections"
                  href="/manage-collection"
                /> */}
              </div>
            )}

            <div className="mt-4">
              <CollectionsSearch
                value={searchTerm}
                onChange={setSearchTerm}
                isLoading={isLoading}
              />
            </div>

            <div className="mt-6">
              <CollectionsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* For Artists and Organizations tabs, use the container component */}
            {activeTab === "Artists" || activeTab === "Organizations" ? (
              <CollectionsContainer
                collections={collections}
                searchTerm={searchTerm}
                activeTab={activeTab}
                isLoading={isLoading}
              />
            ) : (
              <CollectionsGrid
                collections={filteredCollections}
                isLoading={isLoading}
              />
            )}
          </div>
        </GridWrapper>
      </section>
    </div>
  );
}
