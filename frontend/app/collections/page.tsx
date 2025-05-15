"use client";

import React, { useEffect, useState } from "react";
import { GridWrapper } from "../components/ui/grid-wrapper";
import { AnimatedText } from "../components/ui/animated-text";
import { useAuthStatus } from "../lib/hooks/use-auth-status";
import { GrayButton } from "../components/buttons/gray-button";
import { CollectionsSearch } from "../components/collections/collections-search";
import { CollectionsTabs } from "../components/collections/collections-tabs";
import { CollectionsContainer } from "../components/collections/collections-container";
import { CollectionsGrid } from "../components/collections/collections-grid";
import { useCollectionsStore } from "../lib/hooks/use-collections-store";
import { getCollections } from "../lib/services/collection.service";
import { LoaderCircle } from "lucide-react";

export default function CollectionsPage() {
  const { isAuthenticated, userDID } = useAuthStatus();
  const [myCollections, setMyCollections] = useState([]);
  const [loadingMyCollections, setLoadingMyCollections] = useState(false);

  // Get state and actions from the collections store
  const {
    searchTerm,
    activeTab,
    isLoading,
    collections,
    setCollections,
    setSearchTerm,
    setActiveTab,
    setLoading,
    getCollectionsByTab,
  } = useCollectionsStore();

  // Fetch collections from the API
  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true);
        const response = await getCollections();
        
        if (response && response.collections) {
          // Filter out default collections
          const filteredCollections = response.collections.filter(collection => 
            collection.name !== "Default Collection" && 
            collection.id !== "default" &&
            !collection.name?.toLowerCase().includes("default")
          );
          setCollections(filteredCollections);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, [setCollections, setLoading]);

  // Fetch user's collections if authenticated
  useEffect(() => {
    if (isAuthenticated && userDID) {
      async function fetchMyCollections() {
        try {
          setLoadingMyCollections(true);
          const response = await getCollections({ creatorId: userDID });
          
          if (response && response.collections) {
            // Filter out default collections
            const filteredCollections = response.collections.filter(collection => 
              collection.name !== "Default Collection" && 
              collection.id !== "default" &&
              !collection.name?.toLowerCase().includes("default")
            );
            setMyCollections(filteredCollections);
          }
        } catch (error) {
          console.error("Error fetching user collections:", error);
        } finally {
          setLoadingMyCollections(false);
        }
      }

      fetchMyCollections();
    }
  }, [isAuthenticated, userDID]);

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

      {/* My Collections Section */}
      {isAuthenticated && (
        <section>
          <GridWrapper>
            <div className="relative text-balance px-6 py-8 md:px-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-garamond italic font-medium">My Collections</h2>
                <GrayButton text="Manage Collections" href="/collections/manage" />
              </div>

              {loadingMyCollections ? (
                <div className="flex justify-center py-16">
                  <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : myCollections.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {myCollections.map((collection: any) => (
                    <CollectionsGrid.Item
                      key={collection.id}
                      collection={collection}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg text-text-secondary mb-4">You haven&apos;t created any collections yet</p>
                  <GrayButton text="Create Collection" href="/create-collection" />
                </div>
              )}
            </div>
          </GridWrapper>
        </section>
      )}
    </div>
  );
}
