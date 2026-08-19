import { ProjectCard } from "@/components/project-card";
import { OpenProjectChatButton } from "@/components/project-chat";
import { getPinnedRepos } from "@/lib/github";
import { getScreenshotUrl } from "@/lib/microlink";
import { site } from "@/lib/site";
import { btnSecondary, pageWrap, panel, panelSoft } from "@/lib/styles";

export const revalidate = 28800;

export default async function ProjectsPage() {
  const { repos, error } = await getPinnedRepos(site.githubUser);

  const screenshots = await Promise.all(
    repos.map((repo) => getScreenshotUrl(repo.homepageUrl ?? repo.url)),
  );

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className={pageWrap}>
        <header className={`${panelSoft} p-5 md:p-4`}>
          <h1 className="text-[30px] font-bold tracking-tight max-[500px]:text-[24px]">
            Projects
          </h1>
          <p className="mt-2 max-w-[36rem] text-[15px] leading-relaxed text-foreground/85">
            Pinned repositories from GitHub.
          </p>
          <div className="mt-4">
            <OpenProjectChatButton className={btnSecondary} />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-5 pb-2">
          {error ? (
            <p className={`${panel} p-5 text-sm leading-relaxed`}>
              Could not load pinned repositories right now. Try again later.
            </p>
          ) : null}

          {!error && repos.length === 0 ? (
            <p className={`${panel} p-5 text-sm leading-relaxed`}>
              No pinned repositories yet.
            </p>
          ) : null}

          {repos.map((repo, i) => (
            <ProjectCard
              key={repo.url}
              repo={repo}
              screenshotUrl={screenshots[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
