"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

export interface Tab {
  label: string;
  icon: LucideIcon;
}

export interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (label: string) => void;
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
}: AnimatedTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container && activeTab) {
      const activeTabElement = activeTabRef.current;

      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;

        const clipLeft = offsetLeft + 16;
        const clipRight = offsetLeft + offsetWidth + 16;

        container.style.clipPath = `inset(0 ${Number(
          100 - (clipRight / container.offsetWidth) * 100,
        ).toFixed()}% 0 ${Number(
          (clipLeft / container.offsetWidth) * 100,
        ).toFixed()}% round 17px)`;
      }
    }
  }, [activeTab]);

  return (
    <div className="space-y-4">
      <div className="border-primary/10 relative mx-auto flex w-fit flex-col items-center rounded-full border bg-white/50 px-4 py-2">
        <div
          ref={containerRef}
          className="absolute z-10 w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_17px)] [transition:clip-path_0.25s_ease]"
        >
          <div className="relative flex w-full justify-center bg-white">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => onTabChange(tab.label)}
                className="text-primary-foreground hover:text-primary-foreground/90 flex h-8 items-center gap-2 rounded-full p-3 text-sm font-medium"
                tabIndex={-1}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex w-full justify-center">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.label;

            return (
              <button
                key={index}
                ref={isActive ? activeTabRef : null}
                onClick={() => onTabChange(tab.label)}
                className="text-muted-foreground flex h-8 cursor-pointer items-center gap-2 rounded-full p-3 text-sm font-medium"
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
