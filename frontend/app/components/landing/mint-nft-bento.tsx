"use client";

import { BentoCard } from "../cards/bento-card";
import { CirclePattern } from "../svg/circle-pattern";
import { Record } from "../svg/record";

export function MintNFT() {
  return (
    <BentoCard height="h-[300px]">
      <div className="flex flex-col">
        <div className="z-10 h-full">
          <div className="flex h-full flex-col justify-between">
            <h2 className="mb-2 text-base font-medium">Mint your Drop</h2>
            <p className="max-h-[150px] overflow-hidden text-base text-text-secondary">
              <span className="line-clamp-4 text-ellipsis">
                You were there! Mint your Proof of Attendance and keep this
                moment forever.
              </span>
            </p>
          </div>
          <div className="user-select-none pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:-bottom-1">
            <Record albumImageUrl={"/landing/family.png"} />
          </div>
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2">
            <div className="h-[210px] w-[210px] rounded-sm bg-cover bg-center shadow-md"></div>
          </div>
        </div>
        <span className="absolute -bottom-32 left-1/2 -translate-x-1/2">
          <CirclePattern />
        </span>
      </div>
    </BentoCard>
  );
}
