import { getNowPlaying } from "@/lib/spotify";

export async function GET() {
  const nowPlaying = await getNowPlaying();

  return Response.json(nowPlaying, {
    headers: {
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
    },
  });
}
