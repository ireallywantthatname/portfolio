export type PinnedRepo = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  primaryLanguage: { name: string; color: string | null } | null;
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
          }
        }
      }
    }
  }
`;

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
      .filter(
        (node): node is NonNullable<typeof node> & { name: string } =>
          Boolean(node && "name" in node && node.name),
      )
      .map((node) => ({
        name: node.name,
        description: node.description ?? null,
        url: node.url,
        homepageUrl: node.homepageUrl ?? null,
        stargazerCount: node.stargazerCount ?? 0,
        primaryLanguage: node.primaryLanguage ?? null,
      }));

    return { repos };
  } catch (err) {
    return {
      repos: [],
      error: err instanceof Error ? err.message : "Failed to fetch pins",
    };
  }
}
