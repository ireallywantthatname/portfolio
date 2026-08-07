import Link from "next/link";

import { btnPrimary, pageWrap, panelSoft } from "@/lib/styles";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className={pageWrap}>
        <section className={`${panelSoft} p-5 md:p-4`}>
          <p className="text-xs font-bold uppercase tracking-[0.16em]">404</p>
          <h1 className="mt-3 text-[30px] font-bold tracking-tight max-[500px]:text-[24px]">
            Page not found
          </h1>
          <p className="mt-2 max-w-[36rem] text-[15px] leading-relaxed text-foreground/85">
            That route does not exist. Head back home and try again.
          </p>
          <div className="mt-6">
            <Link href="/" className={btnPrimary}>
              Back home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
