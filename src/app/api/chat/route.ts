import { groq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { ConvexHttpClient } from "convex/browser";

import { api } from "../../../../convex/_generated/api";

export const maxDuration = 60;

type SearchHit = {
  repo: string;
  owner: string;
  content: string;
  score: number;
};

function extractText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}

function buildSystemPrompt(hits: SearchHit[]): string {
  const context =
    hits.length === 0
      ? "No project context documents were retrieved."
      : hits
          .map(
            (hit, i) =>
              `[${i + 1}] ${hit.owner}/${hit.repo} (score ${hit.score.toFixed(3)})\n${hit.content}`,
          )
          .join("\n\n---\n\n");

  return `You are a helpful assistant on Akash De Silva's portfolio site.
Answer questions about his projects using ONLY the CONTEXT below from each project's CONTEXT.md.
If the context does not contain the answer, say you do not know from the project docs.
Be concise, clear, and mention the project repo name when relevant.
Do not invent projects, tech stacks, or links that are not in the context.

CONTEXT:
${context}`;
}

export async function POST(req: Request) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new Response("Convex is not configured", { status: 500 });
  }
  if (!process.env.GROQ_API_KEY) {
    return new Response("GROQ_API_KEY is not configured", { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const messages = (body as { messages?: UIMessage[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return new Response("user message required", { status: 400 });
  }

  const query = extractText(lastUser);
  if (!query) {
    return new Response("empty message", { status: 400 });
  }
  if (query.length > 4000) {
    return new Response("message too long", { status: 400 });
  }

  const convex = new ConvexHttpClient(convexUrl);
  let hits: SearchHit[] = [];
  try {
    hits = (await convex.action(api.rag.search, {
      query,
      limit: 8,
    })) as SearchHit[];
  } catch {
    hits = [];
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: groq("qwen/qwen3.6-27b"),
    system: buildSystemPrompt(hits),
    messages: modelMessages,
    providerOptions: {
      groq: {
        reasoningFormat: "hidden",
      },
    },
  });

  return result.toUIMessageStreamResponse({ sendReasoning: false });
}
