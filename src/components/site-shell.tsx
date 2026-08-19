import { Header } from "@/components/header";
import { PersistentResume } from "@/components/persistent-resume";
import {
  ProjectChatProvider,
  ProjectChatWindow,
} from "@/components/project-chat";
import { site } from "@/lib/site";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-pixel outline-border grid h-[90dvh] max-h-[100dvh] w-[1000px] max-w-[100dvw] grid-cols-[100px_auto] rounded-base shadow-[10px_10px_0_0_var(--border)] outline outline-4 max-[600px]:grid-cols-[70px_auto] max-[500px]:grid-cols-1 portrait:h-[100dvh] portrait:w-[100dvw]">
      <header className="relative flex items-center justify-center rounded-l-base border-r-4 border-border bg-main portrait:hidden portrait:rounded-none">
        <p className="-rotate-90 whitespace-nowrap text-[40px] font-bold tracking-[2px] text-main-foreground max-[550px]:text-[30px] max-[550px]:tracking-[1px] [@media(max-height:550px)]:text-[30px] [@media(max-height:550px)]:tracking-[1px]">
          {site.name}
        </p>
      </header>
      <ProjectChatProvider>
        <div className="relative flex h-[90dvh] max-h-[100dvh] flex-col overflow-hidden rounded-br-base rounded-tr-base bg-background portrait:h-[100dvh] portrait:max-h-[100dvh] portrait:w-[100dvw] portrait:max-w-[100dvw] portrait:rounded-none">
          <div className="font-semibold">
            <Header />
          </div>
          <main
            id="main"
            className="main relative h-full max-h-[calc(90dvh-50px)] overflow-y-auto portrait:max-h-[calc(100dvh-50px)]"
            tabIndex={-1}
          >
            {children}
            <PersistentResume />
          </main>
          <ProjectChatWindow />
        </div>
      </ProjectChatProvider>
    </div>
  );
}
