import {
  SiBun,
  SiNextdotjs,
  SiShadcnui,
} from "@icons-pack/react-simple-icons";

function ElysiaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2c-1.2 2.4-2 4.8-2 7.2 0 2.1.6 3.9 1.5 5.3C9.2 13.2 7 10.4 5.2 7.5 3.8 11 3 14.2 3 16.8 3 20.1 5.9 22 9.2 22c1.7 0 3.2-.6 4.3-1.6.4.1.9.2 1.5.2 3.3 0 6.2-1.9 6.2-5.2 0-2.6-.8-5.8-2.2-9.3-1.8 2.9-4 5.7-6.3 7.1.9-1.4 1.5-3.2 1.5-5.3 0-2.4-.8-4.8-2.2-7.2z" />
    </svg>
  );
}

const iconMap = {
  bun: SiBun,
  next: SiNextdotjs,
  shadcn: SiShadcnui,
  elysia: ElysiaIcon,
} as const;

export function TechIcon({
  name,
  className = "size-8",
}: {
  name: keyof typeof iconMap;
  className?: string;
}) {
  const Icon = iconMap[name];
  return <Icon className={className} title="" />;
}
