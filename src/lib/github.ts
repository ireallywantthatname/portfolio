import { site } from "@/lib/site";

export type GitHubProfile = {
  name: string;
  bio: string;
};

export type PinnedRepo = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  primaryLanguage: { name: string; color: string | null } | null;
  readmeImageUrl: string | null;
};

type GraphQLResponse = {
  data?: {
    user?: {
      pinnedItems?: {
        nodes?: Array<
          | {
              name: string;
              description: string | null;
              url: string;
              homepageUrl: string | null;
              stargazerCount: number;
              primaryLanguage: { name: string; color: string | null } | null;
              owner?: { login?: string | null } | null;
              defaultBranchRef?: { name?: string | null } | null;
              readme?: { text?: string | null } | null;
            }
          | null
          | Record<string, never>
        >;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

const PINNED_QUERY = `
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            stargazerCount
            primaryLanguage {
              name
              color
            }
            owner {
              login
            }
            defaultBranchRef {
              name
            }
            readme: object(expression: "HEAD:README.md") {
              ... on Blob {
                text
              }
            }
          }
        }
      }
    }
  }
`;

function extractReadmeImageUrl(
  readmeText: string | null | undefined,
  owner: string,
  repo: string,
  branch: string,
): string | null {
  if (!readmeText) return null;

  const candidates: string[] = [];
  const mdRegex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of readmeText.matchAll(mdRegex)) {
    if (match[1]) candidates.push(match[1]);
  }

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  for (const match of readmeText.matchAll(imgRegex)) {
    if (match[1]) candidates.push(match[1]);
  }

  for (const raw of candidates) {
    const lower = raw.toLowerCase();
    if (
      lower.includes("img.shields.io") ||
      lower.includes("goreportcard.com") ||
      lower.includes("/badge") ||
      lower.endsWith("/icon.svg") ||
      lower.endsWith("/icon.png") ||
      lower === "icon.svg" ||
      lower === "icon.png"
    ) {
      continue;
    }

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    const cleanPath = raw.replace(/^\.?\//, "");
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
  }

  return null;
}

export async function getPinnedRepos(
  login: string,
): Promise<{ repos: PinnedRepo[]; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { repos: [], error: "GITHUB_TOKEN missing" };
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portfolio",
      },
      body: JSON.stringify({
        query: PINNED_QUERY,
        variables: { login },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return {
        repos: [],
        error: `GitHub API ${res.status}`,
      };
    }

    const json = (await res.json()) as GraphQLResponse;
    if (json.errors?.length) {
      return {
        repos: [],
        error: json.errors.map((e) => e.message).join("; "),
      };
    }

    const nodes = json.data?.user?.pinnedItems?.nodes ?? [];
    const repos: PinnedRepo[] = nodes
      .filter((node): node is NonNullable<typeof node> & { name: string } =>
        Boolean(node && "name" in node && node.name),
      )
      .map((node) => {
        const owner = node.owner?.login || login;
        const branch = node.defaultBranchRef?.name || "main";
        return {
          name: node.name,
          description: node.description ?? null,
          url: node.url,
          homepageUrl: node.homepageUrl ?? null,
          stargazerCount: node.stargazerCount ?? 0,
          primaryLanguage: node.primaryLanguage ?? null,
          readmeImageUrl: extractReadmeImageUrl(
            node.readme?.text,
            owner,
            node.name,
            branch,
          ),
        };
      });

    return { repos };
  } catch (err) {
    return {
      repos: [],
      error: err instanceof Error ? err.message : "Failed to fetch pins",
    };
  }
}

export async function getGitHubProfile(
  login: string = site.githubUser,
): Promise<GitHubProfile> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(login)}`,
      {
        headers,
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      return { name: site.name, bio: site.description };
    }

    const json = (await res.json()) as {
      name?: string | null;
      bio?: string | null;
    };

    return {
      name: json.name?.trim() || site.name,
      bio: json.bio?.trim() || site.description,
    };
  } catch {
    return { name: site.name, bio: site.description };
  }
}
