import Link from "next/link";

import { Marquee } from "@/components/marquee";
import { TechIcon } from "@/components/tech-icon";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-6 px-5 pb-8 pt-8 max-[800px]:max-w-[700px] max-[700px]:gap-5 max-[600px]:px-4 max-[500px]:max-w-[560px] max-[400px]:pb-6 max-[400px]:pt-6">
        <section className="rounded-base border-4 border-border bg-main/10 p-5 shadow-shadow md:p-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <p className="text-[38px] font-black leading-[1.05] tracking-[0.06em] max-[500px]:text-[24px] md:text-[30px] lg:text-[34px]">
                  {site.name}
                </p>
                <p className="text-[16px] leading-relaxed tracking-[0.08em] lg:text-[15px]">
                  {site.description}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-base border-4 border-border bg-secondary-background p-4 text-xs font-black uppercase tracking-[0.16em] shadow-shadow">
                  <p>Location</p>
                  <p className="mt-2 text-[15px] normal-case tracking-[0.08em]">
                    {site.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/resume"
                  className="rounded-base border-4 border-border bg-main px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-main-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#000]"
                >
                  View Resume
                </Link>
                <a
                  href={`mailto:${site.email}`}
                  className="rounded-base border-4 border-border bg-secondary-background px-5 py-3 text-xs font-black uppercase tracking-[0.2em] shadow-shadow transition-transform hover:-translate-y-1 hover:bg-main hover:shadow-[7px_7px_0_0_#000]"
                >
                  Start a Project
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-base border-4 border-border bg-secondary-background p-5 shadow-shadow md:p-4">
          <div className="rounded-base border-4 border-border bg-main/15 p-4 shadow-shadow">
            <p className="text-xs font-black uppercase tracking-[0.22em]">
              Built With
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-5 max-[500px]:gap-3">
              {site.builtWith.map((item) => (
                <a
                  key={item.name}
                  className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-xs uppercase tracking-[0.3em] shadow-shadow transition-transform hover:-translate-y-1"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <TechIcon name={item.icon} className="size-8" />
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
