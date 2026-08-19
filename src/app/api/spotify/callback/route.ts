import type { NextRequest } from "next/server";

import { exchangeAuthorizationCode } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return new Response(`Spotify authorization failed: ${error}`, {
      status: 400,
    });
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = request.cookies.get("spotify_oauth_state")?.value;

  if (!code || !state || !expected || state !== expected) {
    return new Response("Invalid Spotify authorization callback", {
      status: 400,
    });
  }

  try {
    const refreshToken = await exchangeAuthorizationCode(code);
    const response = new Response(
      `SPOTIFY_REFRESH_TOKEN=${refreshToken}\n\nAdd this to .env.local and .env.production, then restart the dev server.`,
      {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
    response.headers.append(
      "Set-Cookie",
      "spotify_oauth_state=; Path=/api/spotify; Max-Age=0; HttpOnly; SameSite=Lax",
    );
    return response;
  } catch {
    return new Response("Could not exchange Spotify authorization code", {
      status: 500,
    });
  }
}
