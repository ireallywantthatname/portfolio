import Link from "next/link";

import { Marquee } from "@/components/marquee";
import { TechIcon } from "@/components/tech-icon";
import { site } from "@/lib/site";
import {
  btnChip,
  btnPrimary,
  btnSecondary,
  label,
  pageWrap,
  panel,
  panelInset,
  panelSoft,
} from "@/lib/styles";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className={pageWrap}>
        <section className={`${panelSoft} p-5 md:p-4`}>
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <h1 className="text-[36px] font-bold leading-[1.08] tracking-tight max-[500px]:text-[24px] md:text-[30px] lg:text-[34px]">
                {site.name}
              </h1>
              <p className="max-w-[36rem] text-[16px] leading-relaxed tracking-normal text-foreground/90 lg:text-[15px]">
                {site.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={`${panel} p-4`}>
                <p className={label}>Location</p>
                <p className="mt-2 text-[15px] leading-snug tracking-normal">
                  {site.location}
                </p>
              </div>
              <div className={`${panel} p-4`}>
                <p className={label}>GitHub</p>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[15px] leading-snug tracking-normal underline decoration-2 underline-offset-4 hover:text-main focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  @{site.githubUser}
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/resume" className={btnPrimary}>
                View resume
              </Link>
              <a href={`mailto:${site.email}`} className={btnSecondary}>
                Start a project
              </a>
            </div>
          </div>
        </section>

        <section className={`${panel} p-5 md:p-4`}>
          <div className={`${panelInset} p-4`}>
            <p className={label}>Built with</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 max-[500px]:gap-2">
              {site.builtWith.map((item) => (
                <a
                  key={item.name}
                  className={btnChip}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <TechIcon name={item.icon} className="size-7" />
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="mx-auto w-full max-w-[880px]">
        <Marquee items={site.marquee} />
      </div>
    </div>
  );
}
