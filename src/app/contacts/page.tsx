import { SiGithub, SiProtonmail } from "@icons-pack/react-simple-icons";

import { site } from "@/lib/site";

const links = [
  {
    icon: SiProtonmail,
    href: `mailto:${site.email}`,
    label: "Email",
  },
  {
    icon: SiGithub,
    href: site.github,
    label: "GitHub",
  },
] as const;

export default function ContactsPage() {
  return (
    <div className="p-10 text-xl leading-[1.7] max-[600px]:p-[30px] max-[600px]:text-lg max-[400px]:p-5 max-[400px]:text-base">
      <div className="items-center">
        <div className="h-[40vh] w-full max-w-full resize-none overflow-hidden">
          <iframe
            className="h-full w-full border-none"
            src={site.mapsEmbed}
            title="Current location map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <h3 className="mt-4">
          Current Location:{" "}
          <a
            href={site.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-2 underline-offset-4 hover:text-main"
          >
            {site.location}
          </a>
        </h3>
        <div className="mr-auto mt-10 flex w-full flex-wrap items-center gap-10">
          {links.map((link) => (
            <a
              key={link.label}
              target="_blank"
              rel="noreferrer"
              href={link.href}
              aria-label={link.label}
            >
              <link.icon title={link.label} className="size-8" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
