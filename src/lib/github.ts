export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  topics: string[];
  fork: boolean;
  archived: boolean;
};

export type Project = {
  name: string;
  lang: string;
  stars: number;
  updated: string;
  desc: string;
  url: string;
  repoUrl: string;
  tags: string[];
};

const USER = "ireallywantthatname";

export async function getRepos(): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`,
    {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }

  const all = (await res.json()) as Repo[];

  return all
    .filter((r) => !r.fork && !r.archived && (r.description || r.homepage))
    .sort(
      (a, b) =>
        new Date(b.pushed_at ?? b.updated_at).getTime() -
        new Date(a.pushed_at ?? a.updated_at).getTime(),
    );
}

export function toProjects(repos: Repo[]): Project[] {
  return repos.map((r) => ({
    name: r.name,
    lang: r.language ?? "—",
    stars: r.stargazers_count,
    updated: toRelative(r.pushed_at ?? r.updated_at),
    desc: r.description ?? "",
    url: r.homepage?.trim() ? r.homepage : r.html_url,
    repoUrl: r.html_url,
    tags: r.topics ?? [],
  }));
}

function toRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.round((now - then) / 1000));
  const min = 60;
  const hour = 60 * min;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffSec < min) return "just now";
  if (diffSec < hour) {
    const n = Math.round(diffSec / min);
    return `${n} minute${n === 1 ? "" : "s"} ago`;
  }
  if (diffSec < day) {
    const n = Math.round(diffSec / hour);
    return `${n} hour${n === 1 ? "" : "s"} ago`;
  }
  if (diffSec < 2 * day) return "yesterday";
  if (diffSec < week) {
    const n = Math.round(diffSec / day);
    return `${n} days ago`;
  }
  if (diffSec < month) {
    const n = Math.round(diffSec / week);
    return `${n} week${n === 1 ? "" : "s"} ago`;
  }
  if (diffSec < year) {
    const n = Math.round(diffSec / month);
    return `${n} month${n === 1 ? "" : "s"} ago`;
  }
  const n = Math.round(diffSec / year);
  return `${n} year${n === 1 ? "" : "s"} ago`;
}
