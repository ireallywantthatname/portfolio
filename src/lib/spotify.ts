export type NowPlayingTrack = {
  title: string;
  artists: string;
  albumImageUrl: string | null;
  trackUrl: string;
};

export type NowPlaying =
  | ({ status: "playing"; progressMs: number; durationMs: number } & NowPlayingTrack)
  | ({ status: "paused" } & NowPlayingTrack)
  | ({ status: "recent" } & NowPlayingTrack)
  | { status: "idle" };

export const SPOTIFY_SCOPES =
  "user-read-currently-playing user-read-recently-played";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";
const idle: NowPlaying = { status: "idle" };

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function basicAuth(clientId: string, clientSecret: string) {
  return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
}

function pickImage(images: unknown): string | null {
  if (!Array.isArray(images)) {
    return null;
  }

  const ranked = images
    .filter(isRecord)
    .map((image) => ({
      url: typeof image.url === "string" ? image.url : null,
      width: typeof image.width === "number" ? image.width : 0,
    }))
    .filter((image): image is { url: string; width: number } => Boolean(image.url))
    .sort((a, b) => a.width - b.width);

  if (ranked.length === 0) {
    return null;
  }

  return (ranked.find((image) => image.width >= 160) ?? ranked[ranked.length - 1])
    .url;
}

function mapItem(item: unknown): NowPlayingTrack | null {
  if (!isRecord(item)) {
    return null;
  }

  const title = typeof item.name === "string" ? item.name : "";
  const trackUrl =
    isRecord(item.external_urls) && typeof item.external_urls.spotify === "string"
      ? item.external_urls.spotify
      : "";
  if (!title || !trackUrl) {
    return null;
  }

  if (item.type === "episode") {
    const show = isRecord(item.show) ? item.show : null;
    const artists =
      show && typeof show.name === "string" ? show.name : "Podcast";
    const albumImageUrl =
      pickImage(item.images) ?? (show ? pickImage(show.images) : null);
    return { title, artists, albumImageUrl, trackUrl };
  }

  const artists = Array.isArray(item.artists)
    ? item.artists
        .filter(isRecord)
        .map((artist) => (typeof artist.name === "string" ? artist.name : ""))
        .filter(Boolean)
        .join(" — ")
    : "";
  const album = isRecord(item.album) ? item.album : null;

  return {
    title,
    artists: artists || "Unknown",
    albumImageUrl: album ? pickImage(album.images) : null,
    trackUrl,
  };
}

export function getSpotifyAuthConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }
  return { clientId, clientSecret, redirectUri };
}

function getSpotifyPlaybackConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }
  return { clientId, clientSecret, refreshToken };
}

export async function exchangeAuthorizationCode(code: string) {
  const config = getSpotifyAuthConfig();
  if (!config) {
    throw new Error("Spotify is not configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuth(config.clientId, config.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Spotify token exchange ${res.status}`);
  }

  const json: unknown = await res.json();
  if (!isRecord(json) || typeof json.refresh_token !== "string") {
    throw new Error("Spotify token exchange missing refresh_token");
  }

  return json.refresh_token;
}

async function refreshAccessToken(force = false) {
  const now = Date.now();
  if (
    !force &&
    cachedToken &&
    cachedToken.expiresAt - 60_000 > now
  ) {
    return cachedToken.accessToken;
  }

  const config = getSpotifyPlaybackConfig();
  if (!config) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: config.refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuth(config.clientId, config.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    cachedToken = null;
    return null;
  }

  const json: unknown = await res.json();
  if (!isRecord(json) || typeof json.access_token !== "string") {
    cachedToken = null;
    return null;
  }

  const expiresIn =
    typeof json.expires_in === "number" ? json.expires_in : 3600;
  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return cachedToken.accessToken;
}

async function spotifyGet(path: string, accessToken: string) {
  return fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

async function getRecentlyPlayed(
  accessToken: string,
): Promise<NowPlaying> {
  const res = await spotifyGet(
    "/me/player/recently-played?limit=1",
    accessToken,
  );
  if (!res.ok) {
    return idle;
  }

  const json: unknown = await res.json();
  if (!isRecord(json) || !Array.isArray(json.items) || json.items.length === 0) {
    return idle;
  }

  const first = json.items[0];
  const track = isRecord(first) ? mapItem(first.track) : null;
  if (!track) {
    return idle;
  }

  return { status: "recent", ...track };
}

export async function getNowPlaying(): Promise<NowPlaying> {
  try {
    let accessToken = await refreshAccessToken();
    if (!accessToken) {
      return idle;
    }

    let res = await spotifyGet(
      "/me/player/currently-playing?additional_types=track,episode",
      accessToken,
    );

    if (res.status === 401) {
      accessToken = await refreshAccessToken(true);
      if (!accessToken) {
        return idle;
      }
      res = await spotifyGet(
        "/me/player/currently-playing?additional_types=track,episode",
        accessToken,
      );
    }

    if (res.status === 204) {
      return getRecentlyPlayed(accessToken);
    }

    if (!res.ok) {
      return idle;
    }

    const json: unknown = await res.json();
    if (!isRecord(json)) {
      return idle;
    }

    const track = mapItem(json.item);
    if (!track) {
      return getRecentlyPlayed(accessToken);
    }

    if (json.is_playing === true) {
      const progressMs =
        typeof json.progress_ms === "number" ? json.progress_ms : 0;
      const durationMs =
        isRecord(json.item) && typeof json.item.duration_ms === "number"
          ? json.item.duration_ms
          : 0;
      return { status: "playing", progressMs, durationMs, ...track };
    }

    return { status: "paused", ...track };
  } catch {
    return idle;
  }
}
