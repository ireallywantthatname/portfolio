export function Marquee({ items }: { items: readonly string[] }) {
  return (
    <div className="relative flex w-full overflow-x-hidden border-y-2 border-border bg-main font-base text-main-foreground dark:bg-secondary-background dark:text-foreground">
      <div className="animate-marquee whitespace-nowrap py-3">
        {items.map((item) => (
          <span key={`a-${item}`} className="mx-4 text-xl">
            {item}
          </span>
        ))}
      </div>
      <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-3">
        {items.map((item) => (
          <span key={`b-${item}`} className="mx-4 text-xl">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
