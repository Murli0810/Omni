import { useCallback, useEffect, useRef, useState } from "react";
import { ACCENT_CLASSES } from "@/data/fleet";
import {
  HAZARD_META,
  spawnDetection,
  stepDetections,
  type SimDetection,
} from "@/lib/dashcam-engine";

export interface CaptureEvent {
  id: string;
  kind: SimDetection["kind"];
  label: string;
  confidence: number;
  plate?: string;
  speedKph?: number;
  lat: number;
  lng: number;
  at: string; // ISO
  image: string; // data URL
}

export interface EngineStats {
  fps: number;
  latencyMs: number;
  detections: SimDetection[];
}

interface Props {
  active: boolean;
  stream: MediaStream | null;
  fileUrl: string | null;
  threshold: number;
  lat: number;
  lng: number;
  onStats: (s: EngineStats) => void;
  onCapture: (c: CaptureEvent) => void;
}

const W = 1280;
const H = 720;

export function Viewfinder({
  active,
  stream,
  fileUrl,
  threshold,
  lat,
  lng,
  onStats,
  onCapture,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionsRef = useRef<SimDetection[]>([]);
  const thresholdRef = useRef(threshold);
  const geoRef = useRef({ lat, lng });
  const onStatsRef = useRef(onStats);
  const onCaptureRef = useRef(onCapture);
  const [ready, setReady] = useState(false);

  thresholdRef.current = threshold;
  geoRef.current = { lat, lng };
  onStatsRef.current = onStats;
  onCaptureRef.current = onCapture;

  // Bind media source
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setReady(false);
    if (stream) {
      v.srcObject = stream;
      v.removeAttribute("src");
    } else if (fileUrl) {
      v.srcObject = null;
      v.src = fileUrl;
    } else {
      v.srcObject = null;
      v.removeAttribute("src");
      return;
    }
    v.muted = true;
    const play = () => {
      setReady(true);
      void v.play().catch(() => undefined);
    };
    v.addEventListener("loadeddata", play);
    return () => v.removeEventListener("loadeddata", play);
  }, [stream, fileUrl]);

  const drawBoxes = useCallback((ctx: CanvasRenderingContext2D, list: SimDetection[]) => {
    for (const d of list) {
      if (d.confidence < thresholdRef.current) continue;
      const meta = HAZARD_META[d.kind];
      const hex = ACCENT_CLASSES[meta.accent].hex;
      const x = d.box.x * W;
      const y = d.box.y * H;
      const w = d.box.w * W;
      const h = d.box.h * H;

      ctx.save();
      ctx.strokeStyle = hex;
      ctx.lineWidth = d.reticle ? 3 : 2;
      ctx.setLineDash(meta.group === "defect" ? [8, 5] : []);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // corner ticks
      const t = 14;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + t);
      ctx.lineTo(x, y);
      ctx.lineTo(x + t, y);
      ctx.moveTo(x + w - t, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - t);
      ctx.stroke();

      if (d.reticle) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy);
        ctx.lineTo(cx + 16, cy);
        ctx.moveTo(cx, cy - 16);
        ctx.lineTo(cx, cy + 16);
        ctx.stroke();
      }

      const label =
        d.kind === "vehicle" && d.vehicleClass
          ? `${d.vehicleClass.replace("_", "-").toUpperCase()} ${d.confidence.toFixed(1)}%`
          : `${meta.label.toUpperCase()} ${d.confidence.toFixed(1)}%`;
      ctx.font = "600 15px ui-monospace, 'JetBrains Mono', monospace";
      const tw = ctx.measureText(label).width + 14;
      const ly = y - 24 < 0 ? y + h + 4 : y - 24;
      ctx.fillStyle = "rgba(9,9,11,0.82)";
      ctx.fillRect(x, ly, tw, 22);
      ctx.fillStyle = hex;
      ctx.fillText(label, x + 7, ly + 16);

      if (d.plate) {
        const plateLabel = `ALPR ${d.plate} · ${d.confidence.toFixed(1)}%`;
        ctx.font = "700 17px ui-monospace, 'JetBrains Mono', monospace";
        const pw = ctx.measureText(plateLabel).width + 16;
        const py = Math.min(H - 30, y + h + 8);
        ctx.fillStyle = "rgba(244,63,94,0.16)";
        ctx.fillRect(x, py, pw, 26);
        ctx.strokeStyle = hex;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, py, pw, 26);
        ctx.fillStyle = "#fecdd3";
        ctx.fillText(plateLabel, x + 8, py + 19);
      }
      ctx.restore();
    }
  }, []);

  // Detection + render loop
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let frames = 0;
    let lastFpsAt = performance.now();
    let fps = 30;
    let latency = 14;
    let sinceSpawn = 0;
    let sincePush = 0;

    const capture = (d: SimDetection) => {
      const meta = HAZARD_META[d.kind];
      const image = canvas.toDataURL("image/jpeg", 0.72);
      onCaptureRef.current({
        id: d.id,
        kind: d.kind,
        label: meta.label,
        confidence: d.confidence,
        ...(d.plate ? { plate: d.plate } : {}),
        ...(d.speedKph ? { speedKph: d.speedKph } : {}),
        lat: geoRef.current.lat,
        lng: geoRef.current.lng,
        at: new Date().toISOString(),
        image,
      });
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const v = videoRef.current;

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, W, H);
      if (v && v.readyState >= 2 && v.videoWidth) {
        const scale = Math.max(W / v.videoWidth, H / v.videoHeight);
        const dw = v.videoWidth * scale;
        const dh = v.videoHeight * scale;
        ctx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
      }

      sinceSpawn += 1;
      if (sinceSpawn > 16 && detectionsRef.current.length < 9) {
        sinceSpawn = 0;
        const d = spawnDetection(thresholdRef.current);
        if (d) {
          detectionsRef.current = [...detectionsRef.current, d];
          const meta = HAZARD_META[d.kind];
          if (
            (meta.group === "defect" || meta.group === "critical") &&
            d.confidence >= thresholdRef.current
          ) {
            setTimeout(() => capture(d), 220);
          }
        }
      }
      detectionsRef.current = stepDetections(detectionsRef.current);
      drawBoxes(ctx, detectionsRef.current);

      // scanline sweep
      const sweep = ((performance.now() / 18) % H) | 0;
      ctx.fillStyle = "rgba(52,211,153,0.05)";
      ctx.fillRect(0, sweep, W, 2);

      frames += 1;
      const now = performance.now();
      if (now - lastFpsAt >= 500) {
        fps = (frames * 1000) / (now - lastFpsAt);
        frames = 0;
        lastFpsAt = now;
        latency = 12 + Math.random() * 6;
      }
      sincePush += 1;
      if (sincePush >= 12) {
        sincePush = 0;
        onStatsRef.current({
          fps: Math.round(fps * 10) / 10,
          latencyMs: Math.round(latency * 10) / 10,
          detections: detectionsRef.current,
        });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, drawBoxes]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-950">
      <video ref={videoRef} playsInline muted loop className="hidden" />
      <canvas ref={canvasRef} width={W} height={H} className="h-full w-full object-cover" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            no signal · select a source
          </p>
        </div>
      )}
    </div>
  );
}
