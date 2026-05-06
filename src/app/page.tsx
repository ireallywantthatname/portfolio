import { Terminal } from "@/components/terminal";
import { deriveBio } from "@/lib/bio";
import { getRepos, toProjects } from "@/lib/github";

export default async function Home() {
  const repos = await getRepos();
  const projects = toProjects(repos);
  const bio = deriveBio(repos);

  return <Terminal projects={projects} bio={bio} />;
}
