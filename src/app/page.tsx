import { ProjectRow } from "@/components/project-row";
import { Section } from "@/components/section";
import { deriveBio } from "@/lib/bio";
import { getRepos } from "@/lib/github";

export default async function Home() {
  const repos = await getRepos();

  return (
    <main className="mx-auto max-w-2xl px-6 py-24 sm:py-32 space-y-24">
      <section>
        <h1 className="text-2xl font-medium tracking-tight">Akash De Silva</h1>
        <p className="mt-3 text-zinc-500">{deriveBio(repos)}</p>
      </section>

      <Section label="Projects">
        <ul className="divide-y divide-black/10 dark:divide-white/15">
          {repos.map((r) => (
            <ProjectRow key={r.name} repo={r} />
          ))}
        </ul>
      </Section>

      <Section label="Elsewhere">
        <ul className="space-y-2">
          <li>
            <a
              href="https://github.com/ireallywantthatname"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub →
            </a>
          </li>
          <li>
            <a
              href="https://akashdesilva.space"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Blog →
            </a>
          </li>
          <li>
            <a
              href="mailto:irwtn@protonmail.com"
              className="underline-offset-4 hover:underline"
            >
              Email →
            </a>
          </li>
        </ul>
      </Section>
    </main>
  );
}
