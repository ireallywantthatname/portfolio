"use client";

import dynamic from "next/dynamic";

const Dither = dynamic(() => import("@/components/dither"), { ssr: false });

export function DitherBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="pointer-events-auto h-full w-full">
        <Dither />
      </div>
    </div>
  );
}
