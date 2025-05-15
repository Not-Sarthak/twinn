"use client";

import { MouseEvent } from "react";
import { motion, useMotionValue, type MotionStyle, type MotionValue } from "framer-motion";
import { cn } from "@/app/lib/utils";

type WrapperStyle = MotionStyle & {
  "--x": MotionValue<string>;
  "--y": MotionValue<string>;
};

interface ProfileCardProps {
  children: React.ReactNode;
  className?: string;
}

function AnimatedCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue("0%");
  const mouseY = useMotionValue("0%");

  const handleMouseMove = ({ clientX, clientY, currentTarget }: MouseEvent) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width;
    const y = (clientY - top) / height;
    mouseX.set(`${x * 100}%`);
    mouseY.set(`${y * 100}%`);
  };

  const style = {
    "--x": mouseX,
    "--y": mouseY,
  } as WrapperStyle;

  return (
    <motion.div
      className={cn(
        "animated-cards group relative w-full cursor-pointer rounded-[16px]",
        className,
      )}
      onMouseMove={handleMouseMove}
      style={style}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-orange-100/40 bg-white shadow-sm transition duration-300",
          "before:absolute before:inset-0 before:h-full before:w-full before:bg-[radial-gradient(800px_circle_at_var(--x)_var(--y),rgba(255,237,213,0.15),transparent_40%)] before:opacity-0 before:transition-opacity before:duration-500 md:hover:border-orange-200/70 md:hover:shadow-md md:hover:before:opacity-100",
        )}
      >
        <div className="w-full">{children}</div>
      </div>
    </motion.div>
  );
}

export function ProfileCard({ children, className }: ProfileCardProps) {
  return (
    <AnimatedCard className={className}>
      <div className="flex flex-col space-y-4 p-4 sm:space-y-6 sm:p-6">
        {children}
      </div>
    </AnimatedCard>
  );
} 