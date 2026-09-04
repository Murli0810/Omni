import type { Accent } from "@/data/fleet";

export type HazardKind =
  | "pothole"
  | "damaged_road"
  | "missing_divider"
  | "missing_zebra"
  | "signboard"
  | "waterlogging"
  | "vehicle"
  | "bottleneck"
  | "pedestrian"
  | "school_zone"
  | "rash_driving"
  | "hit_and_run";

export type VehicleClass = "car" | "bus" | "truck" | "two_wheeler";

export interface HazardMeta {
  label: string;
  accent: Accent;
  group: "defect" | "traffic" | "pedestrian" | "critical";
  alertType: string;
}

export const HAZARD_META: Record<HazardKind, HazardMeta> = {
  pothole: { label: "Pothole", accent: "amber", group: "defect", alertType: "Pothole" },
  damaged_road: {
    label: "Damaged Road Surface",
    accent: "amber",
    group: "defect",
    alertType: "Damaged Road",
  },
  missing_divider: {
    label: "Missing Road Divider",
    accent: "amber",
    group: "defect",
    alertType: "Missing Divider",
  },
  missing_zebra: {
    label: "Missing Zebra Crossing",
    accent: "amber",
    group: "defect",
    alertType: "Missing Zebra Crossing",
  },
  signboard: {
    label: "Damaged Signboard",
    accent: "amber",
    group: "defect",
    alertType: "Damaged Signboard",
  },
  waterlogging: {
    label: "Waterlogging",
    accent: "rose",
    group: "defect",
    alertType: "Waterlogging",
  },
  vehicle: { label: "Vehicle", accent: "emerald", group: "traffic", alertType: "Vehicle Density" },
  bottleneck: {
    label: "Traffic Bottleneck",
    accent: "emerald",
    group: "traffic",
    alertType: "Traffic Bottleneck",
  },
  pedestrian: {
    label: "Pedestrian Zone",
    accent: "emerald",
    group: "pedestrian",
    alertType: "Pedestrian Zone",
  },
  school_zone: {
    label: "School Children Crossing Zone — Slow Down",
    accent: "rose",
    group: "pedestrian",
    alertType: "School Zone Risk",
  },
  rash_driving: {
    label: "Rash Driving",
    accent: "rose",
    group: "critical",
    alertType: "Rash Driving",
  },
  hit_and_run: {
    label: "Hit & Run",
    accent: "rose",
    group: "critical",
    alertType: "Hit-and-Run",
  },
};

export const VEHICLE_CLASS_LABEL: Record<VehicleClass, string> = {
  car: "Cars",
  bus: "Buses",
  truck: "Trucks",
  two_wheeler: "Two-Wheelers",
};

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SimDetection {
  id: string;
  kind: HazardKind;
  vehicleClass?: VehicleClass;
  box: Box; // normalized 0..1
  vx: number;
  vy: number;
  confidence: number; // 0..100
  plate?: string;
  speedKph?: number;
  ttl: number; // frames remaining
  born: number; // epoch ms
  reticle?: boolean;
  captured?: boolean;
}

const PLATE_SERIES = ["JH01", "JH05", "JH02", "WB23", "OD09"];
const LETTERS = "ABCDEFGHJKLMNPRSTUVWXYZ";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function randomPlate(): string {
  const l = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const n = Math.floor(1000 + Math.random() * 8999);
  return `${pick(PLATE_SERIES)}${l()}${l()}${n}`;
}

const DEFECT_KINDS: HazardKind[] = [
  "pothole",
  "pothole",
  "damaged_road",
  "missing_divider",
  "missing_zebra",
  "signboard",
  "waterlogging",
];

const VEHICLE_CLASSES: VehicleClass[] = [
  "car",
  "car",
  "car",
  "two_wheeler",
  "two_wheeler",
  "bus",
  "truck",
];

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

/** Spawns one plausible detection for the current frame, or null. */
export function spawnDetection(threshold: number): SimDetection | null {
  const roll = Math.random();
  const now = Date.now();

  // Vehicles dominate the stream.
  if (roll < 0.52) {
    const vehicleClass = pick(VEHICLE_CLASSES);
    const w = vehicleClass === "two_wheeler" ? 0.09 : vehicleClass === "car" ? 0.16 : 0.24;
    const h = vehicleClass === "two_wheeler" ? 0.14 : 0.2;
    return {
      id: nextId("veh"),
      kind: "vehicle",
      vehicleClass,
      box: { x: 0.06 + Math.random() * 0.78, y: 0.34 + Math.random() * 0.36, w, h },
      vx: (Math.random() - 0.5) * 0.0016,
      vy: 0.0009 + Math.random() * 0.0016,
      confidence: clampConf(72 + Math.random() * 27, threshold),
      speedKph: Math.round(18 + Math.random() * 42),
      ttl: 90 + Math.floor(Math.random() * 80),
      born: now,
    };
  }

  if (roll < 0.74) {
    const kind = pick(DEFECT_KINDS);
    return {
      id: nextId("def"),
      kind,
      box: {
        x: 0.1 + Math.random() * 0.66,
        y: kind === "signboard" ? 0.12 + Math.random() * 0.16 : 0.56 + Math.random() * 0.26,
        w: kind === "signboard" ? 0.1 : 0.14 + Math.random() * 0.14,
        h: kind === "signboard" ? 0.12 : 0.1 + Math.random() * 0.08,
      },
      vx: 0,
      vy: kind === "signboard" ? 0.0004 : 0.0014,
      confidence: clampConf(68 + Math.random() * 30, threshold),
      ttl: 100 + Math.floor(Math.random() * 60),
      born: now,
    };
  }

  if (roll < 0.9) {
    const kind: HazardKind = Math.random() < 0.35 ? "school_zone" : "pedestrian";
    return {
      id: nextId("ped"),
      kind,
      box: { x: 0.08 + Math.random() * 0.7, y: 0.4 + Math.random() * 0.24, w: 0.1, h: 0.22 },
      vx: (Math.random() - 0.5) * 0.0022,
      vy: 0.0006,
      confidence: clampConf(70 + Math.random() * 26, threshold),
      ttl: 110 + Math.floor(Math.random() * 70),
      born: now,
    };
  }

  const kind: HazardKind = Math.random() < 0.45 ? "hit_and_run" : "rash_driving";
  return {
    id: nextId("crit"),
    kind,
    vehicleClass: Math.random() < 0.3 ? "two_wheeler" : "car",
    box: { x: 0.12 + Math.random() * 0.6, y: 0.38 + Math.random() * 0.26, w: 0.2, h: 0.2 },
    vx: (Math.random() < 0.5 ? -1 : 1) * (0.0035 + Math.random() * 0.003),
    vy: 0.0012,
    confidence: clampConf(88 + Math.random() * 10, threshold),
    plate: randomPlate(),
    speedKph: Math.round(62 + Math.random() * 48),
    ttl: 150 + Math.floor(Math.random() * 90),
    born: now,
    reticle: true,
  };
}

function clampConf(raw: number, threshold: number) {
  // Bias confidence so the threshold slider stays meaningful but not empty.
  const v = Math.max(threshold - 12, Math.min(99.4, raw));
  return Math.round(v * 10) / 10;
}

export function stepDetections(list: SimDetection[]): SimDetection[] {
  const out: SimDetection[] = [];
  for (const d of list) {
    const ttl = d.ttl - 1;
    if (ttl <= 0) continue;
    const x = d.box.x + d.vx;
    const y = d.box.y + d.vy * (d.kind === "vehicle" ? 1 : 1.1);
    if (y > 1.02 || x < -0.25 || x > 1.2) continue;
    out.push({ ...d, ttl, box: { ...d.box, x, y } });
  }
  return out;
}

export function formatCoord(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

export function istStamp(d: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} IST`;
}
