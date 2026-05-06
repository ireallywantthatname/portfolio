import type { Repo } from "./github";

function joinOxford(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function deriveBio(repos: Repo[]): string {
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (!r.language) continue;
    counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([lang]) => lang);

  const total = repos.length;
  const langs = top.length > 0 ? `Builds things in ${joinOxford(top)}.` : "";
  const count = `${total} public ${total === 1 ? "repo" : "repos"}.`;

  return [langs, count].filter(Boolean).join(" ");
}
