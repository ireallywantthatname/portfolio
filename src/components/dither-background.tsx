"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Dither = dynamic(() => import("@/components/dither"), { ssr: false });

export function DitherBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <div className="h-full w-full">
        <Dither
          disableAnimation={reduceMotion}
          enableMouseInteraction={false}
        />
      </div>
    </div>
  );
}
