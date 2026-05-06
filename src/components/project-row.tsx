import type { Repo } from "@/lib/github";

export function ProjectRow({ repo }: { repo: Repo }) {
  const primary = repo.homepage?.trim() ? repo.homepage : repo.html_url;

  return (
    <li className="py-5">
      <div className="flex items-baseline justify-between gap-4">
        <a
          href={primary}
          className="font-medium underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {repo.name}
        </a>
        {repo.language && (
          <span className="font-mono text-xs text-zinc-500">
            {repo.language}
          </span>
        )}
      </div>
      {repo.description && (
        <p className="mt-1 text-zinc-500">{repo.description}</p>
      )}
      <div className="mt-2 font-mono text-xs">
        <a
          href={repo.html_url}
          className="text-zinc-500 underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/ireallywantthatname/{repo.name}
        </a>
      </div>
    </li>
  );
}
