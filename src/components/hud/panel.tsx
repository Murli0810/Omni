import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ACCENT_CLASSES, type Accent } from "@/data/fleet";

export const glass =
  "bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 shadow-2xl";

export function Panel({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(glass, "rounded-xl", className)} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
          {title}
        </h2>
        {meta ? <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{meta}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AccentBadge({
  accent,
  children,
  pulse = false,
  className,
}: {
  accent: Accent;
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  const a = ACCENT_CLASSES[accent];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        a.text,
        a.bg,
        a.border,
        className,
      )}
    >
      {pulse ? <span className={cn("size-1.5 rounded-full animate-pulse", a.dot)} /> : null}
      {children}
    </span>
  );
}
