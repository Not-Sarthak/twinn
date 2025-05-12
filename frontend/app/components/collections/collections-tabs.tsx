"use client";

import React from "react";
import {
  Star,
  Brush,
  Building2,
  BookmarkCheck,
  LucideIcon,
} from "lucide-react";
import { AnimatedTabs } from "../ui/animated-tabs";

export type CollectionTab = {
  label: string;
  icon: LucideIcon;
};

interface CollectionsTabsProps {
  activeTab: string;
  onTabChange: (label: string) => void;
}

export const CollectionsTabs = ({
  activeTab,
  onTabChange,
}: CollectionsTabsProps) => {
  const tabs = [
    {
      label: "Featured",
      icon: Star,
    },
    {
      label: "All",
      icon: BookmarkCheck,
    },
    {
      label: "Organizations",
      icon: Building2,
    },
    {
      label: "Artists",
      icon: Brush,
    },
  ];

  return (
    <div className="flex justify-center">
      <AnimatedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};
