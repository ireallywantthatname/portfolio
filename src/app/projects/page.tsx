import { ProjectCard } from "@/components/project-card";
import { getPinnedRepos } from "@/lib/github";
import { site } from "@/lib/site";

export default async function ProjectsPage() {
  const { repos, error } = await getPinnedRepos(site.githubUser);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[660px] flex-1 flex-col gap-6 px-5 pb-8 pt-8 max-[800px]:max-w-[620px] max-[600px]:px-4 max-[500px]:max-w-[560px] max-[400px]:pb-6 max-[400px]:pt-6">
        <header className="rounded-base border-4 border-border bg-main/10 p-5 shadow-shadow md:p-4">
          <p className="text-center text-[34px] font-black uppercase tracking-[0.2em] max-[500px]:text-[28px]">
            Projects
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-6 pb-4">
          {error ? (
            <p className="rounded-base border-4 border-border bg-secondary-background p-5 text-sm shadow-shadow">
              Could not load pinned repos. Check `GITHUB_TOKEN`.
            </p>
          ) : null}

          {!error && repos.length === 0 ? (
            <p className="rounded-base border-4 border-border bg-secondary-background p-5 text-sm shadow-shadow">
              No pinned repositories yet.
            </p>
          ) : null}

          {repos.map((repo) => (
            <ProjectCard key={repo.url} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  );
}
