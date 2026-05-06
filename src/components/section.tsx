import type { ReactNode } from "react";

export function Section({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {label && (
        <h2 className="mb-6 font-mono text-xs tracking-widest uppercase text-zinc-500">
          {label}
        </h2>
      )}
      {children}
    </section>
  );
}
