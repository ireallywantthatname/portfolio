import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { chunkMarkdown } from "./lib/chunk";
import { embedDocuments, embedQuery } from "./lib/embed";
import { fetchContextMd, listPinnedRepos } from "./lib/github";

const DEFAULT_OWNER = "ireallywantthatname";

export const replaceRepoChunks = internalMutation({
  args: {
    owner: v.string(),
    repo: v.string(),
    sourceSha: v.optional(v.string()),
    chunks: v.array(
      v.object({
        chunkIndex: v.number(),
        content: v.string(),
        embedding: v.array(v.float64()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projectChunks")
      .withIndex("by_repo", (q) =>
        q.eq("owner", args.owner).eq("repo", args.repo),
      )
      .take(500);

    for (const row of existing) {
      await ctx.db.delete("projectChunks", row._id);
    }

    const now = Date.now();
    for (const chunk of args.chunks) {
      await ctx.db.insert("projectChunks", {
        owner: args.owner,
        repo: args.repo,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        embedding: chunk.embedding,
        sourceSha: args.sourceSha,
        updatedAt: now,
      });
    }

    return { deleted: existing.length, inserted: args.chunks.length };
  },
});

export const fetchChunksByIds = internalQuery({
  args: { ids: v.array(v.id("projectChunks")) },
  handler: async (ctx, args) => {
    const docs: Doc<"projectChunks">[] = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get("projectChunks", id);
      if (doc) docs.push(doc);
    }
    return docs;
  },
});

export const reindexRepo = internalAction({
  args: {
    owner: v.string(),
    repo: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await fetchContextMd(args.owner, args.repo);
    if (!file) {
      await ctx.runMutation(internal.rag.replaceRepoChunks, {
        owner: args.owner,
        repo: args.repo,
        chunks: [],
      });
      return { status: "cleared" as const, chunks: 0 };
    }

    const pieces = chunkMarkdown(file.content);
    if (pieces.length === 0) {
      await ctx.runMutation(internal.rag.replaceRepoChunks, {
        owner: args.owner,
        repo: args.repo,
        sourceSha: file.sha,
        chunks: [],
      });
      return { status: "empty" as const, chunks: 0 };
    }

    const embeddings = await embedDocuments(pieces);
    const chunks = pieces.map((content, chunkIndex) => {
      const embedding = embeddings[chunkIndex];
      if (!embedding) {
        throw new Error("embedding count mismatch");
      }
      return {
        chunkIndex,
        content,
        embedding,
      };
    });

    await ctx.runMutation(internal.rag.replaceRepoChunks, {
      owner: args.owner,
      repo: args.repo,
      sourceSha: file.sha,
      chunks,
    });

    return { status: "indexed" as const, chunks: chunks.length };
  },
});

export const reindexPinned = internalAction({
  args: {
    owner: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = args.owner ?? process.env.GITHUB_OWNER ?? DEFAULT_OWNER;
    const repos = await listPinnedRepos(owner);
    const results: Array<{
      owner: string;
      repo: string;
      status: string;
      chunks: number;
    }> = [];

    for (const item of repos) {
      const result: {
        status: string;
        chunks: number;
      } = await ctx.runAction(internal.rag.reindexRepo, item);
      results.push({
        owner: item.owner,
        repo: item.repo,
        status: result.status,
        chunks: result.chunks,
      });
    }

    return { owner, count: results.length, results };
  },
});

export const bootstrap = action({
  args: {
    owner: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    owner: string;
    count: number;
    results: Array<{
      owner: string;
      repo: string;
      status: string;
      chunks: number;
    }>;
  }> => {
    return await ctx.runAction(internal.rag.reindexPinned, {
      owner: args.owner,
    });
  },
});

export const search = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = args.query.trim();
    if (!query) {
      return [] as Array<{
        repo: string;
        owner: string;
        content: string;
        score: number;
      }>;
    }

    const limit = Math.min(Math.max(args.limit ?? 8, 1), 16);
    const embedding = await embedQuery(query);
    const hits = await ctx.vectorSearch("projectChunks", "by_embedding", {
      vector: embedding,
      limit,
    });

    const docs: Doc<"projectChunks">[] = await ctx.runQuery(
      internal.rag.fetchChunksByIds,
      { ids: hits.map((h) => h._id) },
    );
    const byId = new Map(docs.map((d) => [d._id, d]));

    return hits
      .map((hit) => {
        const doc = byId.get(hit._id);
        if (!doc) return null;
        return {
          repo: doc.repo,
          owner: doc.owner,
          content: doc.content,
          score: hit._score,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  },
});
