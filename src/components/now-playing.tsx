"use client";

import { SiSpotify } from "@icons-pack/react-simple-icons";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import type { NowPlaying } from "@/lib/spotify";
import { label, panel } from "@/lib/styles";
import { cn } from "@/lib/utils";

function headingFor(status: NowPlaying["status"]) {
  if (status === "playing") {
    return "Now playing";
  }
  if (status === "paused") {
    return "Paused";
  }
  if (status === "recent") {
    return "Last played";
  }
  return "Not playing";
}

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function isTrack(
  value: NowPlaying,
): value is Exclude<NowPlaying, { status: "idle" }> {
  return value.status !== "idle";
}

function useNowPlaying() {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;

    async function load() {
      controller?.abort();
      controller = new AbortController();
      try {
        const res = await fetch("/api/spotify/now-playing", {
          signal: controller.signal,
        });
        if (cancelled) {
          return;
        }
        if (!res.ok) {
          setData((current) => current ?? { status: "idle" });
          return;
        }
        const json = (await res.json()) as NowPlaying;
        setData(json);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (!cancelled) {
          setData((current) => current ?? { status: "idle" });
        }
      }
    }

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 30_000);

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, []);

  return data;
}

function useProgress(
  playing: Extract<NowPlaying, { status: "playing" }> | null,
) {
  const [progressMs, setProgressMs] = useState(playing?.progressMs ?? 0);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const started = performance.now();
    const base = playing.progressMs;
    const duration = playing.durationMs;
    let frame = 0;

    const tick = (now: number) => {
      setProgressMs(Math.min(duration, base + (now - started)));
      frame = window.requestAnimationFrame(tick);
    };

    setProgressMs(base);
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  return progressMs;
}

function Art({
  src,
  alt,
  loading,
}: {
  src: string | null;
  alt: string;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative size-20 shrink-0 overflow-hidden rounded-base border-2 border-border bg-background",
        loading && "motion-safe:animate-pulse",
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={80}
          height={80}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-foreground/40">
          <SiSpotify className="size-7" title="" />
        </div>
      )}
    </div>
  );
}

function Progress({
  progressMs,
  durationMs,
}: {
  progressMs: number;
  durationMs: number;
}) {
  const ratio = durationMs > 0 ? Math.min(1, progressMs / durationMs) : 0;

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-base border-2 border-border bg-background">
        <div className="h-full bg-main" style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className="shrink-0 text-[11px] tabular-nums tracking-[0.06em] text-muted-foreground">
        {formatMs(progressMs)} / {formatMs(durationMs)}
      </p>
    </div>
  );
}

export function NowPlayingCard() {
  const data = useNowPlaying();
  const playing = data?.status === "playing" ? data : null;
  const progressMs = useProgress(playing);
  const loading = data === null;
  const track = data && isTrack(data) ? data : null;

  const body = (
    <Card className={cn(panel, "gap-0 rounded-base py-0 ring-0")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className={label}>
            {loading ? "Now playing" : headingFor(data.status)}
          </p>
          <div className="flex items-center gap-2">
            {data?.status === "playing" ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em]">
                <span className="size-2 rounded-full bg-chart-2 motion-safe:animate-pulse" />
                Live
              </span>
            ) : null}
            <SiSpotify className="size-4" title="Spotify" />
          </div>
        </div>

        <div className="mt-3 flex gap-3">
          <Art
            src={track?.albumImageUrl ?? null}
            alt={track ? `Album art for ${track.title}` : ""}
            loading={loading}
          />
          <div className="min-w-0 flex-1">
            {loading ? (
              <>
                <div className="h-5 w-3/4 rounded-base bg-foreground/10 motion-safe:animate-pulse" />
                <div className="mt-2 h-4 w-1/2 rounded-base bg-foreground/10 motion-safe:animate-pulse" />
              </>
            ) : track ? (
              <>
                <p className="truncate text-[16px] font-bold leading-tight tracking-tight">
                  {track.title}
                </p>
                <p className="mt-1 truncate text-[13px] leading-snug text-foreground/80">
                  {track.artists}
                </p>
              </>
            ) : (
              <p className="text-[15px] leading-snug text-foreground/80">
                Nothing on Spotify right now.
              </p>
            )}
            {playing ? (
              <Progress
                progressMs={progressMs}
                durationMs={playing.durationMs}
              />
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (track) {
    return (
      <a
        href={track.trackUrl}
        target="_blank"
        rel="noreferrer"
        className="block rounded-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {body}
      </a>
    );
  }

  return body;
}
