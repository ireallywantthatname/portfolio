import type { PinnedRepo } from "@/lib/github";
import { cn } from "@/lib/utils";

const linkButton =
  "rounded-base border-3 border-border bg-main px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-main-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]";

export function ProjectCard({ repo }: { repo: PinnedRepo }) {
  const hasLive = Boolean(repo.homepageUrl);

  return (
    <article className="rounded-base border-4 border-border bg-secondary-background p-5 shadow-shadow md:p-4">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[24px] font-black uppercase tracking-[0.18em] max-[500px]:text-[20px]">
              {repo.name}
            </h2>
            {repo.primaryLanguage ? (
              <span className="inline-flex items-center gap-1.5 rounded-base border-2 border-border px-2 py-1 text-[11px] font-bold uppercase tracking-wider">
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: repo.primaryLanguage.color ?? "#888",
                  }}
                />
                {repo.primaryLanguage.name}
              </span>
            ) : null}
          </div>
          {repo.description ? (
            <p className="text-[15px] leading-relaxed tracking-[0.05em] text-foreground/90">
              {repo.description}
            </p>
          ) : null}
          <div
            className={cn(
              "grid gap-4 text-center",
              hasLive
                ? "grid-cols-2 max-[500px]:grid-cols-1"
                : "grid-cols-1",
            )}
          >
            {hasLive ? (
              <a
                href={repo.homepageUrl!}
                target="_blank"
                rel="noreferrer"
                className={linkButton}
              >
                Visit
              </a>
            ) : null}
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className={linkButton}
            >
              Github
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
