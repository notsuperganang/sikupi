"use client";

import { useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TextGenerateEffect } from "./text-generate-effect";
import { cn } from "@/lib/utils";

interface ViewportTextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
  textClassName?: string;
}

export function ViewportTextGenerateEffect({
  words,
  className,
  duration = 0.5,
  filter = true,
  textClassName,
}: ViewportTextGenerateEffectProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isInView) {
      setShouldAnimate(true);
    }
  }, [isInView]);

  return (
    <div ref={ref} className={className}>
      {shouldAnimate ? (
        <TextGenerateEffect
          words={words}
          className={cn("font-bold", textClassName)}
          duration={duration}
          filter={filter}
        />
      ) : (
        <div className={cn("font-bold", textClassName)} style={{ opacity: 0 }}>
          {words}
        </div>
      )}
    </div>
  );
}
