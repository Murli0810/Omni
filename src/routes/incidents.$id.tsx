import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileDown, Gauge, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AccentBadge, Panel, PanelHeader } from "@/components/hud/panel";
import { DarkMap } from "@/components/map/DarkMap";
import { DETECTIONS, TYPE_META, coords, formatStamp } from "@/data/fleet";

export const Route = createFileRoute("/incidents/$id")({
  loader: ({ params }) => {
    const incident = DETECTIONS.find((d) => d.id === params.id);
    if (!incident) throw notFound();
    return { incident };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Incident unavailable | Urban Intelligence" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { incident } = loaderData;
    const title = `${incident.label} — ${incident.id} | Urban Intelligence`;
    const description = `Forensic review of ${incident.label.toLowerCase()} at ${incident.location}, plate ${incident.plate ?? "unknown"}, captured by ${incident.busId}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: IncidentDetail,
});

function IncidentDetail() {
  const { incident } = Route.useLoaderData();
  const snapshot = TYPE_META[incident.type].snapshot;

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-xl transition-colors hover:text-zinc-100"
        >
          <ArrowLeft className="size-3.5" /> incident queue
        </Link>
        <AccentBadge accent="rose" pulse>
          {incident.severity} · forensic review
        </AccentBadge>
        <span className="font-mono text-[11px] text-zinc-500">{incident.id}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Snapshot with AI targeting reticle */}
        <Panel className="overflow-hidden lg:col-span-3">
          <PanelHeader
            title="Camera Evidence Frame"
            meta={`${incident.cameraId} · ${formatStamp(incident.detectedAt)}`}
          />
          <div className="relative">
            <img
              src={snapshot}
              alt={`Vehicle snapshot for incident ${incident.id}`}
              width={1280}
              height={960}
              className="w-full object-cover"
            />
            {/* scanning overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/30" />

              {/* bounding box around the number plate */}
              <div className="absolute left-[41%] top-[55%] h-[7%] w-[19%] border border-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.6)]">
                <span className="absolute -left-px -top-px size-2 border-l-2 border-t-2 border-rose-400" />
                <span className="absolute -right-px -top-px size-2 border-r-2 border-t-2 border-rose-400" />
                <span className="absolute -bottom-px -left-px size-2 border-b-2 border-l-2 border-rose-400" />
                <span className="absolute -bottom-px -right-px size-2 border-b-2 border-r-2 border-rose-400" />
                <span className="absolute -top-6 left-0 whitespace-nowrap rounded border border-rose-500/40 bg-rose-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-rose-300 backdrop-blur-sm">
                  plate roi
                </span>
              </div>

              {/* reticle */}
              <div className="absolute left-[50.5%] top-[58.5%] size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-500/40">
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-rose-500/30" />
                <span className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-rose-500/30" />
                <span className="absolute inset-6 rounded-full border border-rose-500/20 animate-pulse" />
              </div>

              <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider text-rose-300 shadow-[0_0_22px_rgba(244,63,94,0.35)] backdrop-blur-md">
                <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />
                ocr confidence: {incident.confidence.toFixed(1)}%
              </span>
              <span className="absolute right-3 top-3 rounded-md border border-zinc-700/70 bg-zinc-950/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-md">
                yolo-v8n · edge tpu
              </span>
            </div>
          </div>
        </Panel>

        {/* Metadata */}
        <div className="space-y-4 lg:col-span-2">
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              extracted license plate
            </p>
            <p className="mt-2 font-mono text-[30px] font-bold leading-none tracking-tight text-rose-500">
              {incident.plate ?? "UNREADABLE"}
            </p>
            <p className="mt-2 font-mono text-[10.5px] text-zinc-500">
              state jharkhand · rto jsr-05 · commercial: no
            </p>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader title="Event Metadata" meta={incident.label} />
            <dl className="divide-y divide-zinc-800/70">
              {[
                ["Timestamp", formatStamp(incident.detectedAt)],
                ["Vehicle Speed", `${incident.speedKph ?? "—"} km/h`],
                ["Bus Camera ID", `${incident.busId} / ${incident.cameraId}`],
                ["GPS Coordinates", coords(incident.lat, incident.lng)],
                ["Location", incident.location],
                ["Bus Route", incident.route],
                ["Status", incident.status.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{k}</dt>
                  <dd className="max-w-[60%] text-right font-mono text-[11.5px] text-zinc-100">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-2 gap-px border-t border-zinc-800/80 bg-zinc-800/60">
              <div className="flex items-center gap-2 bg-zinc-900/60 px-4 py-3">
                <Gauge className="size-4 text-amber-400" />
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                    over limit
                  </p>
                  <p className="font-mono text-[13px] text-amber-400">
                    +{Math.max(0, (incident.speedKph ?? 0) - 50)} km/h
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/60 px-4 py-3">
                <MapPin className="size-4 text-emerald-400" />
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                    geo-fence
                  </p>
                  <p className="font-mono text-[13px] text-emerald-400">central zone</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Evidence packet ${incident.id} queued`, {
                    description: "PDF with frame, OCR trace and GPS log is being generated.",
                  });
                  if (typeof window !== "undefined") window.print();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/15 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-rose-300 transition-colors hover:bg-rose-500/25"
              >
                <FileDown className="size-4" /> export evidence pdf
              </button>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader title="Incident Geolocation" meta={coords(incident.lat, incident.lng)} />
            <div className="h-[220px] w-full">
              <DarkMap
                detections={[incident]}
                center={[incident.lat, incident.lng]}
                zoom={15}
                selectedId={incident.id}
                variant="mini"
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
