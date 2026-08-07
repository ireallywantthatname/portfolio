"use client";

import dynamic from "next/dynamic";

const Dither = dynamic(() => import("@/components/dither"), { ssr: false });

export function DitherBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="h-full w-full">
        <Dither disableAnimation={false} enableMouseInteraction />
      </div>
    </div>
  );
}
