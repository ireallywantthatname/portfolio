import {
  SiC,
  SiCplusplus,
  SiCss,
  SiDart,
  SiGnubash,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiKotlin,
  SiOpenjdk,
  SiPhp,
  SiPython,
  SiRuby,
  SiRust,
  SiSwift,
  SiTypescript,
} from "@icons-pack/react-simple-icons";
import type { ComponentType } from "react";

import type { PinnedRepo } from "@/lib/github";
import { btnPrimary, btnSecondary, panel } from "@/lib/styles";
import { cn } from "@/lib/utils";

const languageIcons: Record<
  string,
  ComponentType<{ className?: string; color?: string; title?: string }>
> = {
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  Python: SiPython,
  Go: SiGo,
  Rust: SiRust,
  Java: SiOpenjdk,
  PHP: SiPhp,
  Ruby: SiRuby,
  "C++": SiCplusplus,
  C: SiC,
  Swift: SiSwift,
  Kotlin: SiKotlin,
  Dart: SiDart,
  HTML: SiHtml5,
  CSS: SiCss,
  Shell: SiGnubash,
};

function LanguageLogo({
  name,
  color,
}: {
  name: string;
  color: string | null;
}) {
  const Icon = languageIcons[name];
  if (!Icon) return null;

  return (
    <Icon
      className="size-5 shrink-0"
      color={color ?? "currentColor"}
      title={name}
    />
  );
}

export function ProjectCard({ repo }: { repo: PinnedRepo }) {
  const hasLive = Boolean(repo.homepageUrl);

  return (
    <article className={cn(panel, "relative p-5 md:p-4")}>
      <div className="space-y-4">
        <div className="space-y-3">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight max-[500px]:text-[18px]">
            {repo.name}
          </h2>
          {repo.description ? (
            <p className="max-w-[42rem] text-[15px] leading-relaxed text-foreground/90">
              {repo.description}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {repo.primaryLanguage ? (
              <span className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-background px-2.5 py-1 font-bold tracking-[0.08em]">
                <LanguageLogo
                  name={repo.primaryLanguage.name}
                  color={repo.primaryLanguage.color}
                />
                {repo.primaryLanguage.name}
              </span>
            ) : null}
            {repo.stargazerCount > 0 ? (
              <span className="tabular-nums tracking-[0.06em] text-muted-foreground">
                {repo.stargazerCount} star
                {repo.stargazerCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "grid gap-3",
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
                className={btnPrimary}
              >
                Visit
              </a>
            ) : null}
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className={hasLive ? btnSecondary : btnPrimary}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
