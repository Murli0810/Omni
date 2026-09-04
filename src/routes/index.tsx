import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Radio } from "lucide-react";
import { DarkMap } from "@/components/map/DarkMap";
import { AccentBadge, Panel, PanelHeader } from "@/components/hud/panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ACCENT_CLASSES,
  DETECTIONS,
  HERO_STATS,
  TYPE_META,
  coords,
  timeAgo,
} from "@/data/fleet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Fleet Overview | Urban Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Real-time overview of 42 AI-equipped city buses: active defects, critical incidents, average delay and a live detection feed on a dark GIS map.",
      },
      { property: "og:title", content: "Live Fleet Overview | Urban Intelligence Dashboard" },
      {
        property: "og:description",
        content:
          "Monitor road defects, congestion and safety incidents detected by bus cameras across Jamshedpur in real time.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({ stat }: { stat: (typeof HERO_STATS)[number] }) {
  const a = ACCENT_CLASSES[stat.accent];
  const up = stat.trend >= 0;
  return (
    <Panel className="p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {stat.label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className={cn("font-mono text-3xl font-semibold leading-none", a.text)}>
            {stat.value}
          </p>
          <p className="mt-1.5 font-mono text-[10px] text-zinc-500">{stat.unit}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px]",
            up
              ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
          )}
        >
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(stat.trend).toFixed(1)}%
        </span>
      </div>
    </Panel>
  );
}

function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(DETECTIONS[0]!.id);
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {HERO_STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-10">
        <Panel className="overflow-hidden lg:col-span-7">
          <PanelHeader
            title="Geospatial Detection Grid"
            meta="CartoDB dark matter · 14 live markers · Jamshedpur 22.8046° N, 86.2029° E"
            action={
              <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400 sm:flex">
                <Radio className="size-3 animate-pulse" /> streaming
              </span>
            }
          />
          <div className="h-[460px] w-full">
            <DarkMap
              detections={DETECTIONS}
              selectedId={selectedId}
              onSelect={setSelectedId}
              showHeatmap
            />
          </div>
        </Panel>

        <Panel className="overflow-hidden lg:col-span-3">
          <PanelHeader title="Live Event Feed" meta="auto-ingest · edge inference v4.2" />
          <ScrollArea className="h-[460px]">
            <ul className="divide-y divide-zinc-800/70">
              {DETECTIONS.map((d) => {
                const meta = TYPE_META[d.type];
                const a = ACCENT_CLASSES[meta.accent];
                return (
                  <li
                    key={d.id}
                    onMouseEnter={() => setSelectedId(d.id)}
                    className={cn(
                      "cursor-default px-4 py-3 transition-colors",
                      selectedId === d.id ? "bg-zinc-800/40" : "hover:bg-zinc-800/25",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <AccentBadge accent={meta.accent} pulse={d.severity === "critical"}>
                        {meta.label}
                      </AccentBadge>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {timeAgo(d.detectedAt)}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-[12.5px] text-zinc-200">{d.location}</p>
                    <p className="mt-1 font-mono text-[10px] text-zinc-500">
                      {d.busId} · {coords(d.lat, d.lng)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={cn("font-mono text-[10px]", a.text)}>
                        conf {d.confidence.toFixed(1)}%
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          d.type === "incident"
                            ? navigate({ to: "/incidents/$id", params: { id: d.id } })
                            : navigate({ to: "/infrastructure" })
                        }
                        className="rounded-md border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
                      >
                        view
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </Panel>
      </div>
    </div>
  );
}
