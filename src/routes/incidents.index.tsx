import { createFileRoute, Link } from "@tanstack/react-router";
import { AccentBadge, Panel, PanelHeader } from "@/components/hud/panel";
import { DETECTIONS, TYPE_META, coords, formatStamp, timeAgo } from "@/data/fleet";

export const Route = createFileRoute("/incidents/")({
  head: () => ({
    meta: [
      { title: "Safety Incident Queue | Urban Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Queue of hit-and-run, rash driving and signal-jump events captured by bus cameras, ready for forensic review and evidence export.",
      },
      { property: "og:title", content: "Safety Incident Queue | Urban Intelligence Dashboard" },
      {
        property: "og:description",
        content:
          "Review critical road safety incidents with plate OCR, speed estimates and GPS coordinates.",
      },
    ],
  }),
  component: IncidentQueue,
});

function IncidentQueue() {
  const incidents = DETECTIONS.filter((d) => d.type === "incident");

  return (
    <div className="p-4">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Critical Incident Queue"
          meta={`${incidents.length} events pending forensic review`}
        />
        <ul className="divide-y divide-zinc-800/70">
          {incidents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-4 px-4 py-4 hover:bg-zinc-800/25">
              <img
                src={TYPE_META[d.type].snapshot}
                alt={`Snapshot of ${d.label}`}
                loading="lazy"
                width={1280}
                height={960}
                className="h-16 w-24 shrink-0 rounded-md border border-zinc-800 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <AccentBadge accent="rose" pulse>
                    {d.severity}
                  </AccentBadge>
                  <span className="font-mono text-[10px] text-zinc-500">{timeAgo(d.detectedAt)}</span>
                </div>
                <p className="mt-1.5 truncate text-[13px] font-semibold text-zinc-100">{d.label}</p>
                <p className="truncate font-mono text-[10.5px] text-zinc-500">
                  {d.id} · {d.location} · {coords(d.lat, d.lng)}
                </p>
                <p className="mt-0.5 font-mono text-[10.5px] text-zinc-500">
                  {formatStamp(d.detectedAt)} · {d.busId} · {d.cameraId}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">plate</p>
                  <p className="font-mono text-[15px] font-semibold text-rose-500">{d.plate}</p>
                </div>
                <Link
                  to="/incidents/$id"
                  params={{ id: d.id }}
                  className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-rose-400 transition-colors hover:bg-rose-500/20"
                >
                  deep dive
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
