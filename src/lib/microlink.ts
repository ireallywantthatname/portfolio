const REVALIDATE_SECONDS = 60 * 60 * 8;

type MicrolinkResponse = {
  status?: string;
  data?: {
    screenshot?: {
      url?: string;
    };
  };
};

export async function getScreenshotUrl(
  targetUrl: string,
): Promise<string | null> {
  const apiKey = process.env.MICROLINK_API_KEY;
  const endpoint = apiKey
    ? "https://pro.microlink.io"
    : "https://api.microlink.io";

  const url = new URL(endpoint);
  url.searchParams.set("url", targetUrl);
  url.searchParams.set("screenshot", "true");
  url.searchParams.set("meta", "false");

  try {
    const res = await fetch(url.toString(), {
      headers: apiKey ? { "x-api-key": apiKey } : undefined,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as MicrolinkResponse;
    if (json.status !== "success") return null;

    return json.data?.screenshot?.url ?? null;
  } catch {
    return null;
  }
}
