import { NextResponse } from "next/server";

import { getSpotifyAuthConfig, SPOTIFY_SCOPES } from "@/lib/spotify";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  const config = getSpotifyAuthConfig();
  if (!config) {
    return new Response("Spotify is not configured", { status: 500 });
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: config.redirectUri,
    state,
    show_dialog: "true",
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`,
  );
  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/api/spotify",
    maxAge: 600,
  });
  return response;
}
