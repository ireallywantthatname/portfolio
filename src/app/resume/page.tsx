import { site } from "@/lib/site";

export default function ResumePage() {
  return (
    <div className="h-full w-full">
      <iframe
        src={site.resumeEmbed}
        className="h-full min-h-[calc(90dvh-50px)] w-full border-none portrait:min-h-[calc(100dvh-50px)]"
        title="Resume"
      >
        Loading…
      </iframe>
    </div>
  );
}
