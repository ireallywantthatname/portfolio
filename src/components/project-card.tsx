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
import { cn } from "@/lib/utils";

const linkButton =
  "rounded-base border-3 border-border bg-main px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-main-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]";

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
      className="size-7 shrink-0 max-[500px]:size-6"
      color={color ?? "currentColor"}
      title={name}
    />
  );
}

export function ProjectCard({ repo }: { repo: PinnedRepo }) {
  const hasLive = Boolean(repo.homepageUrl);

  return (
    <article className="relative rounded-base border-4 border-border bg-secondary-background p-5 shadow-shadow md:p-4">
      {repo.primaryLanguage ? (
        <div className="absolute top-4 right-4 max-[500px]:top-3 max-[500px]:right-3">
          <LanguageLogo
            name={repo.primaryLanguage.name}
            color={repo.primaryLanguage.color}
          />
        </div>
      ) : null}
      <div className="space-y-4">
        <div className="space-y-3">
          <h2 className="pr-10 text-[24px] font-black uppercase tracking-[0.18em] max-[500px]:text-[20px]">
            {repo.name}
          </h2>
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
