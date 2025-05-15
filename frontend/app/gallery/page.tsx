"use client";

import React, { useEffect, useId, useState, useMemo } from "react";
import { GridWrapper } from "../components/ui/grid-wrapper";
import { AnimatedText } from "../components/ui/animated-text";
import { GalleryCard } from "../components/cards/gallery-card";
import { Input } from "../components/ui/input";
import { LoaderCircle, Search, Star, List, Activity } from "lucide-react";
import { AnimatedTabs } from "../components/ui/animated-tabs";
import { POAPDummyData } from "../lib/data";
import { Drop } from "../lib/types";
import { GrayButton } from "../components/buttons/gray-button";
import { getDrops } from "../lib/services/drop.service";
import { useAuthStatus } from "../lib/hooks/use-auth-status";

export default function GalleryPage() {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("All");
  const [drops, setDrops] = useState<Drop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStatus();

  // Fetch drops from the backend
  useEffect(() => {
    async function fetchDrops() {
      try {
        setIsLoading(true);
        const response = await getDrops();
        
        if (response && response.drops && Array.isArray(response.drops)) {
          // Map API response to match the Drop type
          const formattedDrops = response.drops.map((drop: any) => ({
            id: drop.id,
            title: drop.name || drop.title,
            name: drop.name,
            image: drop.image || "https://via.placeholder.com/400",
            date: new Date(drop.startDate || drop.createdAt).toLocaleDateString(),
            description: drop.description,
            supply: drop.maxSupply || drop.numberOfSupply,
            power: drop.power,
            isFeatured: drop.isFeatured || false,
            numberOfCollectors: drop.numberOfCollectors || 0,
            location: drop.location,
            artistInfo: drop.artistInfo,
            externalLink: drop.externalLink,
            collectionId: drop.collectionId,
          }));
          
          setDrops(formattedDrops);
          
          if (formattedDrops.length === 0) {
            setError("No Drops Found. Create a new Drop to get started.");
          } else {
            setError(null);
          }
        } else {
          // Fallback to dummy data if API doesn't return expected format
          setDrops(POAPDummyData);
          setError("API Returned Unexpected Data Format. Using Sample Data Instead.");
        }
      } catch (error) {
        setError("Failed to Load Drops. Using Sample Data Instead.");
        setDrops(POAPDummyData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDrops();
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (inputValue) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [inputValue]);

  const filteredDrops = useMemo(() => {
    const searchTerm = inputValue.toLowerCase().trim();

    if (!searchTerm) {
      return drops;
    }

    return drops.filter(
      (drop) =>
        (drop.id && drop.id.toLowerCase().includes(searchTerm)) ||
        (drop.title && drop.title.toLowerCase().includes(searchTerm)) ||
        (drop.name && drop.name.toLowerCase().includes(searchTerm)) ||
        (drop.description && drop.description.toLowerCase().includes(searchTerm)),
    );
  }, [inputValue, drops]);

  const renderGalleryGrid = (items: Drop[]) => (
    <div className="mx-auto grid w-full grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-4">
      {isLoading ? (
        <div className="col-span-full flex justify-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : items.length > 0 ? (
        items.map((item, index) => <GalleryCard key={item.id || index} {...item} />)
      ) : (
        <div className="col-span-full py-16 text-center text-text-secondary">
          {activeTab === "Featured" ? 
            "No featured drops found. Check the 'All' tab to see all drops." : 
            "No results found. Try a different search term or create a new drop."}
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      label: "All",
      icon: List,
    },
    {
      label: "Featured",
      icon: Star,
    },
    {
      label: "Activity",
      icon: Activity,
    },
  ];

  const renderContent = () => {
    const itemsToRender = inputValue ? filteredDrops : drops;

    switch (activeTab) {
      case "Featured":
        const featuredItems = itemsToRender.filter((item) => item.isFeatured);
        return renderGalleryGrid(featuredItems);
      case "All":
        return renderGalleryGrid(itemsToRender);
      case "Activity":
        return (
          <div className="flex items-center justify-center">
            <p className="text-lg text-text-secondary">Activity Content</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 space-y-10 md:space-y-16">
      <section>
        <GridWrapper>
          <div className="relative text-balance py-4">
            <div className="absolute right-4 top-4 hidden md:block">
              {isAuthenticated && (
              <GrayButton text="Create Drop" href="/create-drop" />
              )}
            </div>

            <AnimatedText
              as="h1"
              delay={0}
              className="mx-auto max-w-2xl text-center font-garamond text-4xl font-medium italic text-text-primary md:text-6xl md:leading-[64px]"
            >
              Twinn Gallery
            </AnimatedText>
            
            <div className="mt-2 mb-4 flex justify-center md:hidden">
              {isAuthenticated && (
                <GrayButton text="Create Drop" href="/create-drop" />
              )}
            </div>
            
            <div className="mt-4 flex justify-center">
              <div className="w-full max-w-md">
                <div className="relative">
                  <Input
                    id={id}
                    className="border-primary/10 focus:border-primary/20 peer w-full bg-white/50 pe-9 ps-9 backdrop-blur-sm"
                    placeholder="Search by ID or Title"
                    type="search"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    {isLoading ? (
                      <LoaderCircle
                        className="animate-spin"
                        size={16}
                        strokeWidth={2}
                        role="status"
                        aria-label="Loading..."
                      />
                    ) : (
                      <Search size={16} strokeWidth={2} aria-hidden="true" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <AnimatedTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
            
            {error && (
              <div className="mt-4 text-center text-sm text-orange-500">
                {error}
              </div>
            )}
          </div>
        </GridWrapper>

        <div className="my-8 flex justify-center items-center w-full">{renderContent()}</div>
      </section>
    </div>
  );
}
