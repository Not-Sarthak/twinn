"use client";

import { useEffect, useState } from "react";
import { MomentsBento } from "./components/landing/moments-bento";
import { CalendarBento } from "./components/landing/calendar-bento";
import { ConnectionsBento } from "./components/landing/connections-bento";
import { AnimatedText } from "./components/ui/animated-text";
import { PhotoGallery } from "./components/landing/photo-gallery";
import { GridWrapper } from "./components/ui/grid-wrapper";
import { NewsletterSignUp } from "./components/footer/newsletter";
import { ScrapbookBento } from "./components/landing/scrapbook-bento";
import { MintNFT } from "./components/landing/mint-nft-bento";
import { BentoPattern } from "./components/svg/bento-pattern";
import { HeroVideo } from "./components/landing/hero-video";
import { useAuthStatus } from "./lib/hooks/use-auth-status";
import { getDrops } from "./lib/services/drop.service";
import { GrayButton } from "./components/buttons/gray-button";
import { LoaderCircle } from "lucide-react";
import { GalleryCard } from "./components/cards/gallery-card";
import { Drop } from "./lib/types";

export default function Home() {
  const PROFILE_DELAY = 0;
  const HEADING_DELAY = PROFILE_DELAY + 0.2;
  const PARAGRAPH_DELAY = HEADING_DELAY + 0.1;
  const PHOTOS_DELAY = PARAGRAPH_DELAY + 0.1;
  
  const { isAuthenticated, userDID } = useAuthStatus();
  const [userDrops, setUserDrops] = useState<Drop[]>([]);
  const [loadingDrops, setLoadingDrops] = useState<boolean>(false);

  // Fetch user's drops if authenticated
  useEffect(() => {
    if (isAuthenticated && userDID) {
      async function fetchUserDrops() {
        try {
          setLoadingDrops(true);
          const response = await getDrops({ creatorId: userDID });
          
          if (response && response.drops) {
            // Filter out default drops
            const filteredDrops = response.drops.filter(drop => 
              drop.name !== "Default Drop" && 
              drop.id !== "default" &&
              !drop.name?.toLowerCase().includes("default")
            );
            setUserDrops(filteredDrops);
          }
        } catch (error) {
          console.error("Error fetching user drops:", error);
        } finally {
          setLoadingDrops(false);
        }
      }

      fetchUserDrops();
    }
  }, [isAuthenticated, userDID]);

  return (
    <section>
      <HeroVideo />

      <div className="mt-6 space-y-10 md:space-y-16">
        <section>
          <div className="relative text-balance  hidden lg:flex flex-col">
            <GridWrapper>
              <AnimatedText
                as="h1"
                delay={HEADING_DELAY}
                className="mx-auto max-w-2xl text-center text-4xl font-medium leading-tight tracking-tighter text-text-primary md:text-6xl md:leading-[64px]"
              >
                Bookmark your life, <br /> with Twinn
              </AnimatedText>
            </GridWrapper>
            <GridWrapper>
              <div className="mt-4 text-center md:mt-8">
                <AnimatedText
                  as="p"
                  delay={PARAGRAPH_DELAY}
                  className="leading-8 text-text-secondary"
                >
                  A digital badge for every moment you showed up.
                </AnimatedText>
              </div>
            </GridWrapper>
          </div>
          <div>
            {/* Desktop Photos */}
            <div className="relative hidden h-fit w-full items-center justify-center lg:flex">
              <PhotoGallery animationDelay={PHOTOS_DELAY} />
            </div>
          </div>
        </section>

        {/* My Drops Section - Only shown when user is authenticated */}
        {isAuthenticated && (
          <section>
            <GridWrapper>
              <div className="relative text-balance px-6 py-8 md:px-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-garamond italic font-medium">My Drops</h2>
                  <GrayButton text="Create New Drop" href="/create-drop" />
                </div>

                {loadingDrops ? (
                  <div className="flex justify-center py-16">
                    <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                ) : userDrops.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {userDrops.map((drop) => (
                      <GalleryCard key={drop.id} {...drop} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-lg text-text-secondary mb-4">You haven&apos;t created any drops yet</p>
                    <GrayButton text="Create Drop" href="/create-drop" />
                  </div>
                )}
              </div>
            </GridWrapper>
          </section>
        )}

        {/* About Section */}
        <section className="relative space-y-10 md:space-y-16">
          <BentoPattern />
          <div className="space-y-4">
            <GridWrapper>
              <div className="text-center text-sm font-medium text-indigo-600">
                <span>Features</span>
              </div>
            </GridWrapper>
            <GridWrapper>
              <h2 className="mx-auto max-w-lg text-balance text-center text-3xl font-medium leading-10 tracking-tight text-text-primary md:text-4xl">
                Here&apos;s what sets Twinn apart and makes it unique
              </h2>
            </GridWrapper>
          </div>

          <GridWrapper>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-3">
              <div className="md:col-span-2">
                <ScrapbookBento />
              </div>
              <div className="md:col-span-1">
                <MomentsBento />
              </div>
              <div className="md:col-span-3">
                <CalendarBento />
              </div>
              <div className="md:col-span-1">
                <MintNFT />
              </div>
              <div className="md:col-span-2">
                <ConnectionsBento />
              </div>
            </div>
          </GridWrapper>
        </section>

        {/* Newsletter Section */}
        <section>
          <NewsletterSignUp />
        </section>
      </div>
    </section>
  );
}
