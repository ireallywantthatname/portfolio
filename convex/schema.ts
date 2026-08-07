import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projectChunks: defineTable({
    owner: v.string(),
    repo: v.string(),
    chunkIndex: v.number(),
    content: v.string(),
    embedding: v.array(v.float64()),
    sourceSha: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_repo", ["owner", "repo"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["repo"],
    }),
});
