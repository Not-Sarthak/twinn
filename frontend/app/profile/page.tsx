"use client";

import { useEffect, useState } from "react";
import { useAuthStatus } from "../lib/hooks/use-auth-status";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useBalance } from "../lib/hooks/use-balance";
import { useCreditsStore } from "../lib/hooks/use-credits-store";
import { AnimatedText } from "../components/ui/animated-text";
import Link from "next/link";
import { shortenAddress } from "../lib/utils";
import Image from "next/image";
import { ProfileCard } from "../components/cards/profile-card";
import { ShimmerCard } from "../components/ui/shimmer";

export default function ProfilePage() {
  // State
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { isAuthenticated, userDID, userEmail, userName, userSolanaAddress } = useAuthStatus();
  const router = useRouter();
  const { balance, loading: balanceLoading } = useBalance();
  const { credits } = useCreditsStore();

  // Fetch user data
  useEffect(() => {
    if (!isAuthenticated || !userDID) {
      router.push("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://twinn-h59i.onrender.com/api/users/me", {
          headers: {
            Authorization: `Bearer ${userDID}`
          }
        });
        
        // Filter out default collections and drops
        let filteredData = { ...response.data };
        
        if (filteredData.collections && Array.isArray(filteredData.collections)) {
          filteredData.collections = filteredData.collections.filter((collection: any) => 
            collection.name !== "Default Collection" && 
            collection.id !== "default" &&
            !collection.name?.toLowerCase().includes("default")
          );
        }
        
        if (filteredData.drops && Array.isArray(filteredData.drops)) {
          filteredData.drops = filteredData.drops.filter((drop: any) => 
            drop.name !== "Default Drop" && 
            drop.id !== "default" &&
            !drop.name?.toLowerCase().includes("default")
          );
        }
        
        setUserData(filteredData);
        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, userDID, router]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {/* Shimmer for profile card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
            <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
                <div className="flex-1">
                  <div className="h-8 w-48 rounded-md bg-gray-200 animate-pulse mb-2"></div>
                  <div className="h-4 w-32 rounded-md bg-gray-200 animate-pulse"></div>
                  
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="h-16 rounded-lg bg-gray-200 animate-pulse"></div>
                    <div className="h-16 rounded-lg bg-gray-200 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shimmer for stats card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
            <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
              <div className="h-6 w-32 rounded-md bg-gray-200 animate-pulse mb-4"></div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Shimmer for collections */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
            <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
              <div className="h-6 w-40 rounded-md bg-gray-200 animate-pulse mb-4"></div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 flex-col items-center justify-center">
          <div className="text-lg text-red-500">{error}</div>
          <button 
            onClick={() => router.push("/")}
            className="mt-4 rounded-full bg-dark-primary px-4 py-2 text-white hover:bg-dark-primary/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <AnimatedText 
        as="h1" 
        className="mx-auto mb-6 max-w-2xl text-center font-garamond text-3xl font-medium italic text-text-primary sm:text-4xl md:mb-8 md:text-5xl lg:text-6xl lg:leading-[64px]"
        duration={0.8}
      >
        My Profile
      </AnimatedText>

      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
          <div className="relative z-10 w-full rounded-xl bg-white sm:rounded-2xl">
            <ProfileCard>
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
                <div className="flex-1 text-center sm:text-left">
                  <AnimatedText as="h2" className="text-2xl font-garamond italic" delay={0.2}>
                    {userName || "Anonymous User"}
                  </AnimatedText>
                  {userEmail && (
                    <AnimatedText as="p" className="text-gray-600 font-garamond italic" delay={0.3}>
                      {userEmail}
                    </AnimatedText>
                  )}
                  
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AnimatedText delay={0.4} className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Wallet Address</p>
                      <p className="mt-1 truncate text-sm font-medium">
                        {userSolanaAddress ? shortenAddress(userSolanaAddress) : "Not connected"}
                      </p>
                    </AnimatedText>
                    
                    <AnimatedText delay={0.4} className="rounded-lg bg-orange-100 p-4 border-[1px] border-dashed border-orange-500">
                      <p className="text-sm text-gray-500">Credits Balance</p>
                      {balanceLoading ? (
                        <div className="mt-1 h-4 w-16 rounded-md bg-gray-200 animate-pulse"></div>
                      ) : (
                        <p className="mt-1 text-sm font-bold">{credits}</p>
                      )}
                    </AnimatedText>
                  </div>
                </div>
              </div>
            </ProfileCard>
          </div>
        </section>

        {/* Stats Card */}
        <AnimatedText delay={0.5}>
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
            <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Activity Stats</h3>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-orange-100 p-4 flex flex-col items-center text-center border-[1px] border-dashed border-orange-500">
                  <p className="text-sm text-gray-500">Collections</p>
                  <p className="mt-1 text-xl font-bold">{userData?.user?.numberOfCollectionsCreated || 0}</p>
                </div>
                
                <div className="rounded-lg bg-orange-100 p-4 flex flex-col items-center text-center border-[1px] border-dashed border-orange-500">
                  <p className="text-sm text-gray-500">Drops</p>
                  <p className="mt-1 text-xl font-bold">{userData?.user?.numberOfDropsCreated || 0}</p>
                </div>
                
                <div className="rounded-lg bg-orange-100 p-4 flex flex-col items-center text-center border-[1px] border-dashed border-orange-500">
                  <p className="text-sm text-gray-500">Moments</p>
                  <p className="mt-1 text-xl font-bold">{userData?.user?.numberOfMomentsCreated || 0}</p>
                </div>
                
                <div className="rounded-lg bg-orange-100 p-4 flex flex-col items-center text-center border-[1px] border-dashed border-orange-500">
                  <p className="text-sm text-gray-500">Minted Drops</p>
                  <p className="mt-1 text-xl font-bold">{userData?.user?.numberOfMintedDrops || 0}</p>
                </div>
              </div>
            </div>
          </section>
        </AnimatedText>

        {/* Collections */}
        {userData?.collections?.length > 0 && (
          <AnimatedText delay={0.6}>
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
              <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">My Collections</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {userData.collections.map((collection: any, index: number) => (
                    <Link href={`/collections/${collection.id}`} key={collection.id}>
                      <div className="overflow-hidden rounded-lg bg-gray-50 transition-transform hover:scale-[1.02]">
                        <div className="h-32 bg-gray-200">
                          {collection.coverImage && (
                            <Image   
                              src={collection.coverImage} 
                              alt={collection.name} 
                              className="h-full w-full object-cover"
                              width={400}
                              height={200}
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium">{collection.name}</h4>
                          {collection.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{collection.description}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </AnimatedText>
        )}

        {/* Drops */}
        {userData?.drops?.length > 0 && (
          <AnimatedText delay={0.7}>
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
              <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">My Drops</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {userData.drops.map((drop: any) => (
                    <Link href={`/drops/${drop.id}`} key={drop.id}>
                      <div className="overflow-hidden rounded-lg bg-gray-50 transition-transform hover:scale-[1.02]">
                        <div className="h-32 bg-gray-200">
                          {drop.image && (
                            <Image 
                              src={drop.image} 
                              alt={drop.name} 
                              className="h-full w-full object-cover"
                              width={400}
                              height={200}
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium">{drop.name}</h4>
                          {drop.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{drop.description}</p>
                          )}
                          {drop.collection && drop.collection.name && 
                           drop.collection.name !== "Default Collection" && 
                           drop.collection.id !== "default" && 
                           !drop.collection.name.toLowerCase().includes("default") && (
                            <p className="mt-1 text-xs text-gray-500">
                              Collection: {drop.collection.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </AnimatedText>
        )}

        {/* No Collections or Drops Message */}
        {(!userData?.collections?.length && !userData?.drops?.length) && (
          <AnimatedText delay={0.6}>
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
              <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <h3 className="text-lg font-medium text-gray-900">No Collections or Drops Yet</h3>
                  <p className="mt-2 text-sm text-gray-600">Start Creating your First Collection or Drop to See Them Here.</p>
                  <Link 
                    href="/create-collection" 
                    className="mt-4 rounded-full bg-dark-primary px-4 py-2 text-white hover:bg-dark-primary/90"
                  >
                    Create Collection
                  </Link>
                </div>
              </div>
            </section>
          </AnimatedText>
        )}
      </div>
    </div>
  );
} 