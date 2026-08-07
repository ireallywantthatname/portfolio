const EMBEDDING_DIMS = 768;
const PRIMARY_MODEL = "text-embedding-004";
const FALLBACK_MODEL = "gemini-embedding-001";

type EmbedResponse = {
  embedding?: { values?: number[] };
  error?: { message?: string };
};

type BatchEmbedResponse = {
  embeddings?: Array<{ values?: number[] }>;
  error?: { message?: string };
};

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return key;
}

async function embedOne(
  text: string,
  model: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${getApiKey()}`;
  const body: Record<string, unknown> = {
    model: `models/${model}`,
    content: { parts: [{ text }] },
    taskType,
  };
  if (model === FALLBACK_MODEL) {
    body.outputDimensionality = EMBEDDING_DIMS;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as EmbedResponse;
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Embedding failed (${res.status})`);
  }
  const values = json.embedding?.values;
  if (!values || values.length === 0) {
    throw new Error("Embedding response missing values");
  }
  return normalizeDims(values);
}

function normalizeDims(values: number[]): number[] {
  if (values.length === EMBEDDING_DIMS) return values;
  if (values.length > EMBEDDING_DIMS) return values.slice(0, EMBEDDING_DIMS);
  throw new Error(
    `Embedding dimension mismatch: got ${values.length}, expected ${EMBEDDING_DIMS}`,
  );
}

async function withModelFallback<T>(
  run: (model: string) => Promise<T>,
): Promise<T> {
  try {
    return await run(PRIMARY_MODEL);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("not found") ||
      message.includes("404") ||
      message.includes("deprecated") ||
      message.includes("is not supported")
    ) {
      return await run(FALLBACK_MODEL);
    }
    throw err;
  }
}

export async function embedQuery(text: string): Promise<number[]> {
  return withModelFallback((model) =>
    embedOne(text, model, "RETRIEVAL_QUERY"),
  );
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  return withModelFallback(async (model) => {
    if (texts.length === 1) {
      return [await embedOne(texts[0]!, model, "RETRIEVAL_DOCUMENT")];
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${getApiKey()}`;
    const requests = texts.map((text) => {
      const req: Record<string, unknown> = {
        model: `models/${model}`,
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
      };
      if (model === FALLBACK_MODEL) {
        req.outputDimensionality = EMBEDDING_DIMS;
      }
      return req;
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests }),
    });
    const json = (await res.json()) as BatchEmbedResponse;
    if (!res.ok) {
      throw new Error(
        json.error?.message ?? `Batch embedding failed (${res.status})`,
      );
    }
    const embeddings = json.embeddings ?? [];
    if (embeddings.length !== texts.length) {
      throw new Error(
        `Batch embedding count mismatch: ${embeddings.length} vs ${texts.length}`,
      );
    }
    return embeddings.map((e, i) => {
      const values = e.values;
      if (!values || values.length === 0) {
        throw new Error(`Missing embedding for chunk ${i}`);
      }
      return normalizeDims(values);
    });
  });
}
