export const site = {
  name: "Akash De Silva",
  description: "TypeScript developer. Likes Linux.",
  location: "NSBM Green University",
  email: "irwtn@protonmail.com",
  github: "https://github.com/ireallywantthatname",
  githubUser: "ireallywantthatname",
  resume:
    "https://docs.google.com/document/d/1JGbAhEsbX_8RPMIavcFVlHlWDlOEfDX6Z2YQR07LHms/edit?usp=sharing",
  resumeEmbed:
    "https://docs.google.com/document/d/1JGbAhEsbX_8RPMIavcFVlHlWDlOEfDX6Z2YQR07LHms/edit?embedded=true",
  mapsEmbed:
    "https://www.google.com/maps?q=6.8213291,80.0415729&z=17&output=embed",
  mapsLink: "https://maps.app.goo.gl/UrJeyPC5aGhLVCeu7",
  marquee: ["TypeScript", "Linux", "Bun", "Next.js", "Elysia.js", "shadcn"],
} as const;

export const navItems = [
  { name: "HOME", href: "/" },
  { name: "PROJECTS", href: "/projects" },
  { name: "RESUME", href: "/resume" },
  { name: "CONTACTS", href: "/contacts" },
] as const;
