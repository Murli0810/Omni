import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DarkMap } from "@/components/map/DarkMap";
import { AccentBadge, Panel, PanelHeader } from "@/components/hud/panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ACCENT_CLASSES,
  DETECTIONS,
  ROUTES,
  SEVERITY_ACCENT,
  TYPE_META,
  coords,
  formatStamp,
  type DetectionType,
  type Severity,
} from "@/data/fleet";

export const Route = createFileRoute("/infrastructure")({
  head: () => ({
    meta: [
      { title: "Infrastructure Deficiency Tracker | Urban Intelligence" },
      {
        name: "description",
        content:
          "Filterable register of road deficiencies detected by bus cameras — potholes, waterlogging and damaged signboards with GPS, severity and a synced mini map.",
      },
      { property: "og:title", content: "Infrastructure Deficiency Tracker | Urban Intelligence" },
      {
        property: "og:description",
        content:
          "Track every open road defect by type, severity and bus route, and locate it instantly on the synchronised dark map.",
      },
    ],
  }),
  component: InfrastructurePage,
});

const TYPES: DetectionType[] = ["pothole", "waterlogging", "signboard", "congestion", "incident"];
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

function InfrastructurePage() {
  const [type, setType] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const [route, setRoute] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(DETECTIONS[0]!.id);
  const navigate = useNavigate();

  const rows = useMemo(
    () =>
      DETECTIONS.filter(
        (d) =>
          (type === "all" || d.type === type) &&
          (severity === "all" || d.severity === severity) &&
          (route === "all" || d.route === route),
      ),
    [type, severity, route],
  );

  const active = rows.find((r) => r.id === activeId) ?? rows[0] ?? null;

  return (
    <div className="grid gap-4 p-4 xl:grid-cols-3">
      <Panel className="overflow-hidden xl:col-span-2">
        <PanelHeader
          title="Infrastructure Deficiency Register"
          meta={`${rows.length} records · edge-detected · Jamshedpur zone`}
        />
        <div className="flex flex-wrap gap-2 border-b border-zinc-800/80 px-4 py-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-[168px] border-zinc-800 bg-zinc-900/70 font-mono text-[11px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900/95 backdrop-blur-xl">
              <SelectItem value="all" className="font-mono text-[11px]">All event types</SelectItem>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t} className="font-mono text-[11px]">
                  {TYPE_META[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-8 w-[140px] border-zinc-800 bg-zinc-900/70 font-mono text-[11px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900/95 backdrop-blur-xl">
              <SelectItem value="all" className="font-mono text-[11px]">All severities</SelectItem>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s} className="font-mono text-[11px] capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={route} onValueChange={setRoute}>
            <SelectTrigger className="h-8 w-[220px] border-zinc-800 bg-zinc-900/70 font-mono text-[11px]">
              <SelectValue placeholder="Bus route" />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900/95 backdrop-blur-xl">
              <SelectItem value="all" className="font-mono text-[11px]">All bus routes</SelectItem>
              {ROUTES.map((r) => (
                <SelectItem key={r} value={r} className="font-mono text-[11px]">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[520px]">
          <Table className="text-[12px]">
            <TableHeader>
              <TableRow className="border-zinc-800/80 hover:bg-transparent">
                {["ID", "Type", "Severity", "Location", "Bus ID", "Detection Time", "Action"].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="h-9 font-mono text-[9.5px] uppercase tracking-[0.16em] text-zinc-500"
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => {
                const meta = TYPE_META[d.type];
                const sevAccent = ACCENT_CLASSES[SEVERITY_ACCENT[d.severity]];
                return (
                  <TableRow
                    key={d.id}
                    onMouseEnter={() => setActiveId(d.id)}
                    onClick={() => setActiveId(d.id)}
                    className={cn(
                      "cursor-pointer border-zinc-800/60",
                      activeId === d.id
                        ? "bg-emerald-400/5 shadow-[inset_2px_0_0_0_rgba(52,211,153,0.9)]"
                        : "hover:bg-zinc-800/30",
                    )}
                  >
                    <TableCell className="font-mono text-[11px] text-zinc-400">{d.id}</TableCell>
                    <TableCell>
                      <AccentBadge accent={meta.accent} pulse={d.severity === "critical"}>
                        {meta.label}
                      </AccentBadge>
                    </TableCell>
                    <TableCell className={cn("font-mono text-[11px] uppercase", sevAccent.text)}>
                      {d.severity}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="block truncate text-zinc-200">{d.location}</span>
                      <span className="block font-mono text-[10px] text-zinc-500">
                        {coords(d.lat, d.lng)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-zinc-300">{d.busId}</TableCell>
                    <TableCell className="font-mono text-[10.5px] text-zinc-400">
                      {formatStamp(d.detectedAt)}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (d.type === "incident") {
                            navigate({ to: "/incidents/$id", params: { id: d.id } });
                          } else {
                            setActiveId(d.id);
                          }
                        }}
                        className="rounded-md border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
                      >
                        locate
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center font-mono text-[11px] text-zinc-500">
                    no records match the active filter set
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Panel>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Synced Locator"
          meta={active ? `${active.id} · ${coords(active.lat, active.lng)}` : "no selection"}
        />
        <div className="h-[300px] w-full">
          <DarkMap
            detections={rows}
            selectedId={active?.id ?? null}
            onSelect={setActiveId}
            variant="mini"
            zoom={14}
          />
        </div>
        {active && (
          <div className="space-y-3 p-4">
            <div>
              <p className="text-[13px] font-semibold text-zinc-100">{active.label}</p>
              <p className="mt-0.5 text-[11.5px] text-zinc-400">{active.location}</p>
            </div>
            <img
              src={TYPE_META[active.type].snapshot}
              alt={`Camera snapshot of ${active.label}`}
              loading="lazy"
              width={1024}
              height={768}
              className="h-32 w-full rounded-lg border border-zinc-800 object-cover"
            />
            <dl className="space-y-1.5 font-mono text-[10.5px] text-zinc-500">
              {[
                ["EVENT", active.id],
                ["ROUTE", active.route],
                ["CAMERA", active.cameraId],
                ["CONFIDENCE", `${active.confidence.toFixed(1)}%`],
                ["STATUS", active.status.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt>{k}</dt>
                  <dd className="truncate text-zinc-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Panel>
    </div>
  );
}
