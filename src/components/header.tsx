"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="grid h-[50px] grid-cols-[1fr_1fr_1fr_1fr_50px] border-b-4 border-border text-xl max-[600px]:text-lg max-[400px]:h-10 max-[400px]:text-base portrait:rounded-none"
    >
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-full items-center justify-center border-r-4 border-border uppercase transition-colors duration-150 focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-ring",
              active
                ? "bg-foreground text-background"
                : "text-foreground hover:bg-main/25 active:bg-main/40",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.name}
          </Link>
        );
      })}
      <ThemeSwitcher />
    </nav>
  );
}
