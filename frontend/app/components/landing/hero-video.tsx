"use client";

import { WordRotate } from "../ui/word-rotate";
import { useAuthStatus } from "@/app/lib/hooks/use-auth-status";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export function HeroVideo() {
  const { isAuthenticated } = useAuthStatus();
  const { login } = usePrivy();
  const router = useRouter();

  const handleCreateDrop = async () => {
    if (isAuthenticated) {
      router.push("/create-drop");
    } else {
      await login();
      router.push("/create-drop");
    }
  };

  return (
    <div className="relative h-[100vh] w-full overflow-hidden">
      <style jsx global>{`
        @font-face {
          font-family: "Apple Garamond";
          src: url("/apple_garamond/AppleGaramond.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Apple Garamond";
          src: url("/apple_garamond/AppleGaramond-Bold.ttf") format("truetype");
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
      <video
        className="absolute left-0 top-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/landing/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12">
          <h1
            className="font-apple-garamond mb-1 text-center text-[3rem] italic leading-none text-black sm:text-[4rem] md:text-[5rem] lg:text-[6rem]"
            style={{ fontFamily: "Apple Garamond", fontStyle: "italic" }}
          >
            Twinn
          </h1>
          <div
            className="mb-8 flex items-center justify-center gap-x-3 text-center text-xl text-black sm:text-2xl md:text-3xl lg:text-4xl"
            style={{ fontFamily: "Apple Garamond" }}
          >
            is for
            <WordRotate
              words={[
                "Memories",
                "Collections",
                "Conferences",
                "Product Launches",
              ]}
              duration={2500}
              motionProps={{
                initial: { opacity: 0, y: -50 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 50 },
              }}
            />
          </div>
          <button
            style={{ fontFamily: "Apple Garamond" }}
            className="mt-6 rounded-full bg-black px-6 py-2 text-2xl text-white transition-colors duration-300 hover:bg-black/80"
            onClick={handleCreateDrop}
          >
            Create a Drop
          </button>
        </div>
      </div>
    </div>
  );
}
