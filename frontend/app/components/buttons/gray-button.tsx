"use client";

import Link from "next/link";

export function GrayButton({ text, href }: { text: string; href: string }) {
  return (
    <Link href={href}>
      <button className="flex place-items-center space-x-1 rounded-full bg-dark-primary px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-dark-primary/90 hover:text-white">
        {text}
      </button>
    </Link>
  );
}
