"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="flex h-full w-full items-center justify-center bg-foreground text-[10px] font-bold uppercase tracking-[0.12em] text-background transition-opacity duration-150 hover:opacity-90 focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-ring active:opacity-80 dark:bg-background dark:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span aria-hidden="true">{isDark ? "DAY" : "NITE"}</span>
    </button>
  );
}
