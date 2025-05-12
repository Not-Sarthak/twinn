"use client";

import React, { useId } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { Input } from "../ui/input";

interface CollectionsSearchProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export const CollectionsSearch = ({
  value,
  onChange,
  isLoading,
}: CollectionsSearchProps) => {
  const id = useId();

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <div className="relative">
          <Input
            id={id}
            className="border-primary/10 focus:border-primary/20 peer w-full bg-white/50 pe-9 ps-9 backdrop-blur-sm"
            placeholder="Search collections..."
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
  );
};
