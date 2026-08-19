import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

function isContextPath(path: string): boolean {
  return path === "CONTEXT.md" || path.endsWith("/CONTEXT.md");
}

function pathsTouched(
  commits: Array<{
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>,
): boolean {
  for (const commit of commits) {
    const all = [
      ...(commit.added ?? []),
      ...(commit.modified ?? []),
      ...(commit.removed ?? []),
    ];
    if (all.some(isContextPath)) return true;
  }
  return false;
}

async function verifySignature(
  secret: string,
  body: string,
  header: string | null,
): Promise<boolean> {
  if (!header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  const hex = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expected = `sha256=${hex}`;
  if (expected.length !== header.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ header.charCodeAt(i);
  }
  return mismatch === 0;
}

http.route({
  path: "/github/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const valid = await verifySignature(secret, body, signature);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = req.headers.get("x-github-event");
    if (event === "ping") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (event !== "push") {
      return new Response(JSON.stringify({ ok: true, ignored: event }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (typeof payload !== "object" || payload === null) {
      return new Response("Invalid payload", { status: 400 });
    }

    const data = payload as {
      repository?: {
        name?: string;
        owner?: { login?: string; name?: string };
      };
      commits?: Array<{
        added?: string[];
        modified?: string[];
        removed?: string[];
      }>;
    };

    const owner =
      data.repository?.owner?.login ?? data.repository?.owner?.name ?? null;
    const repo = data.repository?.name ?? null;
    if (!owner || !repo) {
      return new Response("Missing repository", { status: 400 });
    }

    const commits = data.commits ?? [];
    if (!pathsTouched(commits)) {
      return new Response(JSON.stringify({ ok: true, reindex: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ctx.scheduler.runAfter(0, internal.rag.reindexRepo, {
      owner,
      repo,
    });

    return new Response(
      JSON.stringify({ ok: true, reindex: true, owner, repo }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }),
});

export default http;
