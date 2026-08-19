export const panel =
  "rounded-base border-4 border-border bg-secondary-background shadow-shadow";

export const panelSoft =
  "rounded-base border-4 border-border bg-main/10 shadow-shadow";

export const label =
  "text-xs font-bold uppercase tracking-[0.16em] text-foreground";

export const btnBase =
  "inline-flex items-center justify-center rounded-base border-4 border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] shadow-shadow transition-[transform,box-shadow] duration-200 ease-out focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px active:shadow-[2px_2px_0_0_var(--border)]";

export const btnPrimary = `${btnBase} bg-main text-main-foreground hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--border)]`;

export const btnSecondary = `${btnBase} bg-secondary-background text-foreground hover:-translate-y-1 hover:bg-main hover:text-main-foreground hover:shadow-[7px_7px_0_0_var(--border)]`;

export const btnChip =
  "inline-flex items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] shadow-shadow transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[5px_5px_0_0_var(--border)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px active:shadow-[1px_1px_0_0_var(--border)]";

export const pageWrap =
  "mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-6 px-5 pb-10 pt-7 max-[800px]:max-w-[700px] max-[700px]:gap-5 max-[600px]:px-4 max-[500px]:max-w-[560px] max-[400px]:pb-7 max-[400px]:pt-5";
