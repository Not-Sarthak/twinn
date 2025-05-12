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

export default function GalleryPage() {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("Featured");

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

  const filteredPoaps = useMemo(() => {
    const searchTerm = inputValue.toLowerCase().trim();

    if (!searchTerm) {
      return POAPDummyData;
    }

    return POAPDummyData.filter(
      (poap) =>
        poap.id.toLowerCase().includes(searchTerm) ||
        poap.title.toLowerCase().includes(searchTerm),
    );
  }, [inputValue]);

  const renderGalleryGrid = (items: Drop[]) => (
    <div className="mx-auto grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
      {items.length > 0 ? (
        items.map((item, index) => <GalleryCard key={index} {...item} />)
      ) : (
        <div className="col-span-full py-16 text-center text-text-secondary">
          No results found. Try a different search term.
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      label: "Featured",
      icon: Star,
    },
    {
      label: "All",
      icon: List,
    },
    {
      label: "Activity",
      icon: Activity,
    },
  ];

  const renderContent = () => {
    const itemsToRender = inputValue ? filteredPoaps : POAPDummyData;

    switch (activeTab) {
      case "Featured":
        return renderGalleryGrid(
          itemsToRender.filter((item) => item.isFeatured),
        );
      case "All":
        return renderGalleryGrid(itemsToRender);
      case "Activity":
        return (
          <div className="flex items-center justify-center">
            <p className="text-lg text-text-secondary">
              Activity Content
            </p>
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
            <div className="absolute right-4 top-4">
              <GrayButton text="Create Drop" href="/create-drop" />
            </div>

            <AnimatedText
              as="h1"
              delay={0}
              className="mx-auto max-w-2xl text-center font-garamond text-4xl font-medium italic text-text-primary md:text-6xl md:leading-[64px]"
            >
              Twinn Gallery
            </AnimatedText>
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
          </div>
        </GridWrapper>

        <div className="my-8">{renderContent()}</div>
      </section>
    </div>
  );
}
