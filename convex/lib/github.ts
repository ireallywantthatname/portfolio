export type ContextFile = {
  content: string;
  sha: string;
} | null;

type ContentsResponse = {
  type?: string;
  encoding?: string;
  content?: string;
  sha?: string;
  message?: string;
};

type GraphQLPinnedResponse = {
  data?: {
    user?: {
      pinnedItems?: {
        nodes?: Array<{ name?: string; owner?: { login?: string } } | null>;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set");
  }
  return token;
}

export async function fetchContextMd(
  owner: string,
  repo: string,
): Promise<ContextFile> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/CONTEXT.md`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portfolio-rag",
      },
    },
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`GitHub contents API ${res.status} for ${owner}/${repo}`);
  }

  const json = (await res.json()) as ContentsResponse;
  if (json.type !== "file" || !json.content) {
    return null;
  }

  const encoding = json.encoding ?? "base64";
  if (encoding !== "base64") {
    throw new Error(`Unsupported encoding ${encoding}`);
  }

  const content = atob(json.content.replace(/\n/g, ""));
  return { content, sha: json.sha ?? "" };
}

export async function listPinnedRepos(
  login: string,
): Promise<Array<{ owner: string; repo: string }>> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "portfolio-rag",
    },
    body: JSON.stringify({
      query: `
        query($login: String!) {
          user(login: $login) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  owner { login }
                }
              }
            }
          }
        }
      `,
      variables: { login },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL ${res.status}`);
  }

  const json = (await res.json()) as GraphQLPinnedResponse;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  const nodes = json.data?.user?.pinnedItems?.nodes ?? [];
  return nodes
    .filter(
      (n): n is { name: string; owner: { login: string } } =>
        Boolean(n?.name && n.owner?.login),
    )
    .map((n) => ({ owner: n.owner.login, repo: n.name }));
}
