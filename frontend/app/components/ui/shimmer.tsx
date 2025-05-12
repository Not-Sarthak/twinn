import { cn } from "../../lib/utils";

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
        className,
      )}
    />
  );
}

export function ShimmerCard() {
  return (
    <div className="overflow-hidden rounded-[24px] bg-neutral-50 p-2 dark:bg-neutral-800">
      <div className="space-y-4">
        <Shimmer className="h-[190px] w-full rounded-[20px]" />
        <div className="space-y-2 p-4">
          <Shimmer className="h-6 w-3/4" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
