import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { DarkMap } from "@/components/map/DarkMap";
import { Panel } from "@/components/hud/panel";
import { Switch } from "@/components/ui/switch";
import { DETECTIONS, TYPE_META } from "@/data/fleet";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "GIS Hazard Map | Urban Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Full-bleed dark GIS map of road hazards, congestion heatmaps and critical incidents detected by bus-mounted AI cameras.",
      },
      { property: "og:title", content: "GIS Hazard Map | Urban Intelligence Dashboard" },
      {
        property: "og:description",
        content:
          "Toggle hazard, congestion and incident layers over a dark city basemap with per-pin snapshot and confidence details.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const [layers, setLayers] = useState({ hazards: true, heatmap: true, incidents: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      DETECTIONS.filter((d) => {
        if (d.type === "incident") return layers.incidents;
        if (d.type === "congestion") return layers.heatmap;
        return layers.hazards;
      }),
    [layers],
  );

  const toggles = [
    { key: "hazards" as const, label: "Road Hazards", hint: "potholes · signboards · waterlogging" },
    { key: "heatmap" as const, label: "Congestion Heatmap", hint: "vehicle density zones" },
    { key: "incidents" as const, label: "Critical Incidents", hint: "hit & run · rash driving" },
  ];

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <DarkMap
        detections={visible}
        zoom={12}
        selectedId={selectedId}
        onSelect={setSelectedId}
        showHeatmap={layers.heatmap}
      />

      <Panel className="absolute right-4 top-4 z-[1000] w-[268px] p-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          <Layers className="size-3.5 text-emerald-400" />
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
            layer control
          </h2>
        </div>
        <div className="mt-3 space-y-3">
          {toggles.map((t) => (
            <label key={t.key} className="flex cursor-pointer items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-[12.5px] text-zinc-200">{t.label}</span>
                <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                  {t.hint}
                </span>
              </span>
              <Switch
                checked={layers[t.key]}
                onCheckedChange={(v) => setLayers((prev) => ({ ...prev, [t.key]: v }))}
                className="mt-0.5 data-[state=checked]:bg-emerald-400"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-zinc-800/80 pt-3 font-mono text-[10px] text-zinc-500">
          <div className="flex justify-between">
            <span>markers</span>
            <span className="text-zinc-200">{visible.length}</span>
          </div>
          <div className="flex justify-between">
            <span>tiles</span>
            <span className="text-zinc-200">osm/dark-hud</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["incident", "pothole", "congestion"] as const).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-800 px-1.5 py-0.5 font-mono text-[9px] uppercase text-zinc-400"
            >
              <span
                className="size-1.5 rounded-full"
                style={{
                  background:
                    TYPE_META[t].accent === "rose"
                      ? "#f43f5e"
                      : TYPE_META[t].accent === "amber"
                        ? "#fbbf24"
                        : "#34d399",
                }}
              />
              {TYPE_META[t].label}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}
