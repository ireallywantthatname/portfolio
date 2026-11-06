import type { Metadata } from "next";

import { DitherBackground } from "@/components/dither-background";
import { SiteShell } from "@/components/site-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { getGitHubProfile } from "@/lib/github";
import { site } from "@/lib/site";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getGitHubProfile(site.githubUser);

  return {
    title: {
      default: profile.name,
      template: `%s · ${profile.name}`,
    },
    description: profile.bio,
    openGraph: {
      title: profile.name,
      description: profile.bio,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: profile.name,
      description: profile.bio,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-base focus:border-4 focus:border-border focus:bg-main focus:px-4 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.16em] focus:text-main-foreground focus:shadow-shadow"
          >
            Skip to content
          </a>
          <DitherBackground />
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
