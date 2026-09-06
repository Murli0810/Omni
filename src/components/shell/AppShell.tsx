import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  Video,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  Construction,
  LayoutDashboard,
  Map as MapIcon,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DETECTIONS, TYPE_META, ZONES } from "@/data/fleet";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "GIS Map", icon: MapIcon },
  { to: "/dashcam", label: "Dashcam", icon: Video },
  { to: "/infrastructure", label: "Infrastructure", icon: Construction },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle },
] as const;

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hidden items-center gap-2 font-mono text-[11px] text-zinc-400 sm:flex">
      <span className="text-zinc-600">IST</span>
      <span className="tabular-nums text-zinc-200">
        {now ? now.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--"}
      </span>
      <span className="text-zinc-600">
        {now ? now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [zone, setZone] = useState<string>(ZONES[0]);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const searchItems = useMemo(() => DETECTIONS.slice(0, 12), []);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-30 hidden h-screen shrink-0 flex-col lg:flex border-r border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl transition-[width] duration-300",
          collapsed ? "w-[68px]" : "w-[228px]",
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800/80 px-4">
          <span className="grid size-7 shrink-0 place-items-center rounded-md border border-emerald-400/30 bg-emerald-400/10 font-mono text-[11px] font-bold text-emerald-400">
            ◉
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold leading-tight">OMNI</p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                Onboard Municipal
              </p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                <span>Network for Inspection</span>
              </p>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[13px] transition-colors",
                  active
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_18px_-4px_rgba(52,211,153,0.55)]"
                    : "border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-800/40 hover:text-zinc-100",
                )}
              >
                {active && (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                )}
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 border-t border-zinc-800/80 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed && "collapse"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-800/80 bg-zinc-900/60 px-4 backdrop-blur-xl">
          <nav className="flex items-center gap-1 lg:hidden">
            {NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  aria-label={item.label}
                  className={cn(
                    "grid size-8 place-items-center rounded-md border",
                    active
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border-zinc-800 text-zinc-400",
                  )}
                >
                  <Icon className="size-4" />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 rounded-md border border-emerald-400/30 sm:flex bg-emerald-400/10 px-2.5 py-1">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
              edge ai fleet online — 42 buses active
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:block">
              <LiveClock />
            </div>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="hidden h-8 w-[190px] border-zinc-800 sm:flex bg-zinc-900/70 font-mono text-[11px] text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900/95 backdrop-blur-xl">
                {ZONES.map((z) => (
                  <SelectItem key={z} value={z} className="font-mono text-[11px]">
                    {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5 text-[11px] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Quick search</span>
              <kbd className="hidden rounded border border-zinc-700 px-1 font-mono text-[9px] text-zinc-500 sm:inline">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search event ID, location, bus, plate…" />
        <CommandList>
          <CommandEmpty>No matching detections.</CommandEmpty>
          <CommandGroup heading="Detections">
            {searchItems.map((d) => (
              <CommandItem
                key={d.id}
                value={`${d.id} ${d.location} ${d.busId} ${d.plate ?? ""} ${d.label}`}
                onSelect={() => {
                  setSearchOpen(false);
                  if (d.type === "incident") {
                    navigate({ to: "/incidents/$id", params: { id: d.id } });
                  } else {
                    navigate({ to: "/infrastructure" });
                  }
                }}
              >
                <span className="font-mono text-[11px] text-zinc-400">{d.id}</span>
                <span className="truncate">{TYPE_META[d.type].label}</span>
                <span className="ml-auto truncate text-[11px] text-zinc-500">{d.location}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
