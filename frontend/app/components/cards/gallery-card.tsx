import { cn } from "../../lib/utils";
import Link from "next/link";
import { Drop } from "../../lib/types";
import Image from "next/image";

type GalleryCardProps = Drop;

function GalleryCard({
  image,
  numberOfCollectors,
  id,
  title,
  date,
  location,
  isNew = false,
  isFeatured = false,
}: GalleryCardProps) {
  return (
    <Link href={`/drops/${id}`} className="block">
      <div
        className={cn(
          "relative isolate h-[410px] w-full min-w-[300px] max-w-[300px] overflow-hidden rounded-3xl p-2",
          "bg-white",
          "bg-gradient-to-br",
          "backdrop-blur-xl backdrop-saturate-[180%]",
          "border border-black/10",
          "translate-z-0 will-change-transform",
        )}
      >
        <div
          className={cn(
            "relative h-full w-full rounded-2xl p-4",
            "bg-gradient-to-br from-black/[0.05] to-transparent",
            "backdrop-blur-md backdrop-saturate-150",
            "border border-black/[0.05]",
            "text-black/90",
            "shadow-sm",
            "translate-z-0 will-change-transform",
            "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/[0.02] before:to-black/[0.01] before:opacity-0 before:transition-opacity",
            "hover:before:opacity-100",
            "flex flex-col items-center",
          )}
        >
          <div className="flex w-full flex-col items-center rounded-2xl bg-white pt-6">
            {isNew && (
              <div className="absolute right-2 top-2 z-10">
                <span className="rounded-lg border-[1px] border-dashed bg-white/50 px-2 py-0.5 text-sm font-medium backdrop-blur-sm">
                  New
                </span>
              </div>
            )}

            <div className="mb-2 h-36 w-36 overflow-hidden rounded-full border-4 border-white">
              <Image
                src={image}
                alt={title}
                width={144}
                height={144}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mb-6 mt-2 rounded-lg bg-black/[0.05] px-4 py-0.5 text-center text-sm">
              {numberOfCollectors} Collectors
            </div>
          </div>

          <div className="w-full overflow-hidden px-1">
            <div className="text-left">
              <div className="mt-2 flex items-center gap-1 text-sm text-text-secondary">
                <span className="">ID</span>
                <p className="">{id}</p>
              </div>
              <div className="truncate text-xl font-semibold text-text-primary">
                {title}
              </div>
              <div className="mt-4 flex flex-col">
                {location && (
                  <div className="truncate text-sm text-text-secondary">
                    {location}
                  </div>
                )}

                <div className="text-sm text-text-secondary">{date}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { GalleryCard };
