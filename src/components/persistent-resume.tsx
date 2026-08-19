"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { site } from "@/lib/site";
import { btnSecondary, pageWrap, panel, panelSoft } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function PersistentResume() {
  const pathname = usePathname();
  const active = pathname === "/resume";
  const [visited, setVisited] = useState(false);
  const mounted = active || visited;

  useEffect(() => {
    if (active) {
      setVisited(true);
    }
  }, [active]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-background text-foreground",
        active
          ? "relative"
          : "invisible pointer-events-none absolute inset-0 overflow-hidden",
      )}
      inert={active ? undefined : true}
      aria-hidden={!active}
    >
      <div className={`${pageWrap} max-w-none`}>
        <header
          className={`${panelSoft} flex flex-wrap items-center justify-between gap-3 p-5 md:p-4`}
        >
          <div>
            <h1 className="text-[30px] font-bold tracking-tight max-[500px]:text-[24px]">
              Resume
            </h1>
            <p className="mt-2 max-w-[36rem] text-[15px] leading-relaxed text-foreground/85">
              Full document below, or open it in a new tab.
            </p>
          </div>
          <a
            href={site.resume}
            target="_blank"
            rel="noreferrer"
            className={btnSecondary}
          >
            Open full
          </a>
        </header>

        <section className={`${panel} min-h-0 flex-1 overflow-hidden p-0`}>
          <iframe
            src={site.resumeEmbed}
            className="h-[min(70dvh,720px)] w-full border-none max-[500px]:h-[60dvh]"
            title="Resume"
          >
            <p className="p-5 text-sm">
              Unable to embed the resume.{" "}
              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-2 underline-offset-4"
              >
                Open it here
              </a>
              .
            </p>
          </iframe>
        </section>
      </div>
    </div>
  );
}
