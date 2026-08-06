"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      type="button"
      className="flex h-full w-full items-center justify-center bg-foreground text-background dark:bg-background dark:text-foreground"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="hidden size-6 stroke-current dark:inline max-[500px]:size-4" />
      <Moon className="inline size-6 stroke-current dark:hidden max-[500px]:size-4" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
