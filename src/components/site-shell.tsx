import { Header } from "@/components/header";
import { site } from "@/lib/site";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-pixel outline-border grid h-[90dvh] max-h-[100dvh] w-[1000px] max-w-[100dvw] grid-cols-[100px_auto] rounded-base shadow-[10px_10px_0_0_#000] outline outline-4 max-[600px]:grid-cols-[70px_auto] max-[500px]:grid-cols-1 portrait:h-[100dvh] portrait:w-[100dvw]">
      <header className="relative flex items-center justify-center rounded-l-base border-r-4 border-border bg-main portrait:hidden portrait:rounded-none">
        <h1 className="-rotate-90 whitespace-nowrap text-[40px] font-bold tracking-[4px] max-[550px]:text-[30px] max-[550px]:tracking-[2px] [@media(max-height:550px)]:text-[30px] [@media(max-height:550px)]:tracking-[2px]">
          <span className="inline-block text-main-foreground">{site.name}</span>
        </h1>
      </header>
      <main className="relative flex h-[90dvh] max-h-[100dvh] flex-col rounded-br-base rounded-tr-base bg-background portrait:h-[100dvh] portrait:max-h-[100dvh] portrait:w-[100dvw] portrait:max-w-[100dvw] portrait:rounded-none">
        <div className="font-semibold">
          <Header />
        </div>
        <div className="main h-full max-h-[calc(90dvh-50px)] overflow-y-auto portrait:max-h-[calc(100dvh-50px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
