"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickAnyWhere, useMediaQuery } from "usehooks-ts";

import { cn } from "../../lib/utils";
import { useRotationVelocity } from "../../lib/hooks/use-rotation-velocity";
import { getRandomNumberInRange } from "../../lib/hooks/use-random-number";
import { useElementBoundingRect } from "../../lib/hooks/use-element-bounding-rect";
import { BentoCard } from "../cards/bento-card";
import Image from "next/image";

function Sticker({
  children,
  index = 1,
  caption,
  className,
  preventYOffsetOnMobile: preventYOffset,
}: {
  children: React.ReactNode;
  index: number;
  caption?: string;
  className?: string;
  preventYOffsetOnMobile?: boolean;
}) {
  // Create refs for the sticker and caption, and set up measurement of elements
  const itemRef = useRef<HTMLDivElement | null>(null);
  const boundingRect = useElementBoundingRect(itemRef);

  // Manage state of stickers
  const [isDragging, setIsDragging] = useState<Boolean>(false);
  const [isCaptionVisible, setIsCaptionVisible] = useState<Boolean>(false);
  const [isModal, setIsModal] = useState<Boolean>(false);

  // Set up initial values persisted in state even while dragging
  const [initialRotation] = useState<number>(getRandomNumberInRange(-15, 15));
  const [initialY] = useState<number>(
    getRandomNumberInRange(10, 25) *
      (index === 0 ? 1 : index % 2 === 0 ? -0.5 : 0.5),
  );

  // Handle smaller devices with different behavior
  const matches = useMediaQuery("(max-width: 768px)");

  function onOpen() {
    if (matches) {
      setIsModal(!isModal);
      setIsCaptionVisible(!isModal);
    }
  }

  function onStart() {
    if (!matches) {
      // setDirty && setDirty(true)
      setIsCaptionVisible(true);
      setIsDragging(true);
    }
  }

  function onEnd() {
    if (!matches) {
      setIsCaptionVisible(false);
      setIsDragging(false);
    }
  }

  useClickAnyWhere((e) => {
    if (
      e.target != itemRef.current &&
      !itemRef.current?.contains(e.target as Node) &&
      isModal &&
      matches
    ) {
      setIsModal(false);
      setIsCaptionVisible(false);
    }
  });

  // Setup rotation based on speed of drag
  const { rotate, x } = useRotationVelocity(initialRotation);

  const stickerVariants = {
    default: {},
    modal: {
      x: -boundingRect.x / 2 + boundingRect.width,
      rotate: 0,
      scale: 1.2,
      zIndex: 1000,
    },
    dragging: {
      scale: 1.2,
      zIndex: 1000,
    },
  };

  return (
    <motion.div
      ref={itemRef}
      variants={{
        hidden: {
          opacity: 0,
          scale: 0.9,
          y: 10,
        },
        shown: {
          opacity: 1,
          scale: 1,
          y: matches && preventYOffset ? Math.abs(initialY) : initialY,
        },
      }}
      style={{
        zIndex: isModal || isDragging ? 1000 : undefined,
      }}
      className={cn("relative cursor-grab active:cursor-grabbing", className)}
    >
      <motion.div
        variants={stickerVariants}
        className={cn(
          "flex-shrink-1 relative h-fit min-w-[96px] drop-shadow-lg",
        )}
        drag={!matches}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragTransition={{
          power: 0.1,
          bounceStiffness: 200,
        }}
        dragElastic={0.8}
        style={{
          rotate: isModal ? 0 : rotate,
          x,
        }}
        animate={
          matches
            ? isModal
              ? "modal"
              : "default"
            : isDragging
              ? "dragging"
              : "default"
        }
        onTap={onOpen}
        onHoverStart={onStart}
        onHoverEnd={onEnd}
        onDragEnd={onEnd}
      >
        <div className="pointer-events-none select-none">{children}</div>

        <AnimatePresence>
          {caption && caption.length > 0 && isCaptionVisible && (
            <motion.div
              key="child"
              initial={{ opacity: 0, y: -48, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 0.9 }}
              exit={{ opacity: 0, y: -48, scale: 0.5 }}
              style={{
                left: `50%`,
                x: `-50%`,
              }}
              className={cn(
                "pointer-events-none absolute top-full z-10 mx-auto mt-2 min-w-[160px] max-w-screen-sm select-none text-balance rounded-sm bg-white/95 px-3 py-2 text-center text-[10px] text-black backdrop-blur-3xl",
              )}
            >
              {caption}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function ScrapbookBento({ className }: { className?: string }) {
  const [resetIndex, setResetIndex] = useState<number>(0);

  const container = {
    hidden: { opacity: 0 },
    shown: {
      opacity: 1,
      transition: {
        delayChilcren: 0,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <BentoCard
      colSpan={9}
      rowSpan={4}
      height="h-[260px]"
      showHoverGradient={false}
      hideOverflow={false}
    >
      <h2 className="mb-2 font-medium">Scrapbook</h2>
      <p className="text-text-secondary">
        Get a collection of memories from your favorite events
      </p>
      <div className="absolute top-0 h-[220px] w-full overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_2px)] [background-size:14px_14px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,black_40%,transparent_100%)]"></div>
      <div
        key={resetIndex}
        className={cn(
          "bg-secondary @container xs:max-h-none w-full rounded-3xl p-6",
          className,
        )}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="shown"
          className="grid h-full w-full grid-cols-4 items-center gap-4"
        >
          <Sticker
            caption="Picked this up at THAT Conference — my first conference of 2025, and a memory I'm glad has a Drop to go with it."
            index={0}
          >
            <Image
              width={80}
              height={80}
              src="/bento/conf.png"
              className="xs:max-w-none max-w-[100px]"
              draggable={false}
              alt="That Conference Sticker"
            />
          </Sticker>
          <Sticker
            caption="Picked this up on launch day — Light Protocol went public, and I was there for it"
            index={1}
          >
            <Image
              width={96}
              height={96}
              src="/bento/light.png"
              className="xs:max-w-none max-w-[100px]"
              draggable={false}
              alt="C3 Dev Fest Sticker"
            />
          </Sticker>
          <Sticker
            caption="This one’s from the LOTR watch party — we came for the movie, stayed for the memories."
            index={2}
          >
            <Image
              width={130}
              height={130}
              src="/bento/lotr.png"
              className=""
              draggable={false}
              alt="LOTR Sticker"
            />
          </Sticker>
          <Sticker
            caption="365 days, 365 commits. This POAP tells the whole story"
            index={3}
          >
            <Image
              width={160}
              height={160}
              src="/cyc_sticker.png"
              draggable={false}
              alt="CYC Sticker"
              className="xs:max-w-none"
            />
          </Sticker>
        </motion.div>
      </div>
    </BentoCard>
  );
}
