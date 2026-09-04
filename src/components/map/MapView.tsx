import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import {
  ACCENT_CLASSES,
  CITY_CENTER,
  CONGESTION_ZONES,
  TYPE_META,
  coords,
  formatStamp,
  type Detection,
} from "@/data/fleet";

export interface MapViewProps {
  detections: Detection[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showHeatmap?: boolean;
  variant?: "rich" | "mini";
}


function FlyTo({ center, zoom }: { center: [number, number]; zoom?: number | undefined }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.6 });
  }, [center[0], center[1], zoom, map]);
  return null;
}

export default function MapView({
  detections,
  center = CITY_CENTER,
  zoom = 13,
  selectedId = null,
  onSelect,
  showHeatmap = false,
  variant = "rich",
}: MapViewProps) {
  const selected = detections.find((d) => d.id === selectedId) ?? null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={variant === "rich"}
      className="size-full bg-zinc-950 [&_.leaflet-container]:bg-zinc-950"
      style={{ background: "#09090b" }}
    >
      <TileLayer
        className="urban-dark-tiles"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {selected ? <FlyTo center={[selected.lat, selected.lng]} zoom={variant === "mini" ? 15 : undefined} /> : null}

      {showHeatmap
        ? CONGESTION_ZONES.map((z) => (
            <Circle
              key={z.id}
              center={[z.lat, z.lng]}
              radius={z.radius}
              pathOptions={{
                color: "#34d399",
                weight: 1,
                opacity: 0.45,
                fillColor: "#34d399",
                fillOpacity: 0.08 + z.density * 0.16,
              }}
            />
          ))
        : null}

      {detections.map((d) => {
        const accent = TYPE_META[d.type].accent;
        const hex = ACCENT_CLASSES[accent].hex;
        const active = d.id === selectedId;
        const size = active ? 30 : 20;
        const icon = L.divIcon({
          className: "urban-pin",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${hex}33;border:1.5px solid ${hex};box-shadow:0 0 ${
            active ? 22 : 10
          }px ${hex}88;position:relative"><span style="position:absolute;inset:${
            active ? 8 : 5
          }px;border-radius:9999px;background:${hex}"></span></span>`,
        });

        return (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect?.(d.id) }}
          >
            {variant === "rich" ? (
              <Popup className="urban-popup" minWidth={240} maxWidth={280}>
                <div className="w-[248px] space-y-2 font-sans">
                  <img
                    src={TYPE_META[d.type].snapshot}
                    alt={`Camera snapshot for ${d.label}`}
                    loading="lazy"
                    className="h-28 w-full rounded-md object-cover"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-100">{d.label}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">{d.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                      <span>Confidence</span>
                      <span style={{ color: hex }}>{d.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${d.confidence}%`, background: hex }}
                      />
                    </div>
                  </div>
                  <dl className="space-y-1 font-mono text-[10px] text-zinc-400">
                    <div className="flex justify-between gap-2">
                      <dt>GPS</dt>
                      <dd className="text-zinc-200">{coords(d.lat, d.lng)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>BUS</dt>
                      <dd className="text-zinc-200">{d.busId}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>TIME</dt>
                      <dd className="text-zinc-200">{formatStamp(d.detectedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </Popup>
            ) : null}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
