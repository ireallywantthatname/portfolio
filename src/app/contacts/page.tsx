import { SiGithub, SiProtonmail } from "@icons-pack/react-simple-icons";

import { site } from "@/lib/site";
import { btnChip, label, pageWrap, panel, panelSoft } from "@/lib/styles";

const links = [
  {
    icon: SiProtonmail,
    href: `mailto:${site.email}`,
    label: "Email",
    detail: site.email,
  },
  {
    icon: SiGithub,
    href: site.github,
    label: "GitHub",
    detail: `@${site.githubUser}`,
  },
] as const;

export default function ContactsPage() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className={pageWrap}>
        <header className={`${panelSoft} p-5 md:p-4`}>
          <h1 className="text-[30px] font-bold tracking-tight max-[500px]:text-[24px]">
            Contacts
          </h1>
          <p className="mt-2 max-w-[36rem] text-[15px] leading-relaxed text-foreground/85">
            Reach out by email or on GitHub.
          </p>
        </header>

        <section className={`${panel} overflow-hidden p-0`}>
          <div className="h-[36vh] min-h-[200px] w-full max-w-full overflow-hidden border-b-4 border-border">
            <iframe
              className="h-full w-full border-none"
              src={site.mapsEmbed}
              title="Current location map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="p-5 md:p-4">
            <p className={label}>Current location</p>
            <a
              href={site.mapsLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[16px] leading-snug underline decoration-2 underline-offset-4 hover:text-main focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {site.location}
            </a>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              target="_blank"
              rel="noreferrer"
              href={link.href}
              className={btnChip}
            >
              <link.icon title={link.label} className="size-6" />
              <span className="flex flex-col items-start gap-0.5 normal-case tracking-normal">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  {link.label}
                </span>
                <span className="text-sm font-bold">{link.detail}</span>
              </span>
            </a>
          ))}
        </section>
      </div>
    </div>
  );
}
