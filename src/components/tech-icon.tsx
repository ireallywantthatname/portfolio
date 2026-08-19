import { SiBun, SiNextdotjs } from "@icons-pack/react-simple-icons";

const iconMap = {
  bun: SiBun,
  next: SiNextdotjs,
} as const;

export function TechIcon({
  name,
  className = "size-8",
}: {
  name: keyof typeof iconMap;
  className?: string;
}) {
  const Icon = iconMap[name];
  return <Icon className={className} title={name} />;
}
