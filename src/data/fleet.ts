import potholeImg from "@/assets/detection-pothole.jpg";
import waterloggingImg from "@/assets/detection-waterlogging.jpg";
import congestionImg from "@/assets/detection-congestion.jpg";
import incidentImg from "@/assets/incident-snapshot-1.jpg";

export type DetectionType =
  | "pothole"
  | "waterlogging"
  | "signboard"
  | "congestion"
  | "incident";

export type Severity = "critical" | "high" | "medium" | "low";
export type Accent = "rose" | "amber" | "emerald";

export interface Detection {
  id: string;
  type: DetectionType;
  label: string;
  severity: Severity;
  lat: number;
  lng: number;
  location: string;
  busId: string;
  route: string;
  cameraId: string;
  detectedAt: string; // ISO
  confidence: number; // 0-100
  status: "unresolved" | "in-progress" | "resolved";
  plate?: string;
  speedKph?: number;
}

export const TYPE_META: Record<
  DetectionType,
  { label: string; accent: Accent; snapshot: string }
> = {
  incident: { label: "Safety Incident", accent: "rose", snapshot: incidentImg },
  waterlogging: { label: "Waterlogging", accent: "rose", snapshot: waterloggingImg },
  pothole: { label: "Pothole", accent: "amber", snapshot: potholeImg },
  signboard: { label: "Damaged Signboard", accent: "amber", snapshot: potholeImg },
  congestion: { label: "Congestion", accent: "emerald", snapshot: congestionImg },
};

export const ACCENT_CLASSES: Record<
  Accent,
  { text: string; bg: string; border: string; dot: string; hex: string }
> = {
  rose: {
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
    hex: "#f43f5e",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    dot: "bg-amber-400",
    hex: "#fbbf24",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    dot: "bg-emerald-400",
    hex: "#34d399",
  },
};

export const CITY_CENTER: [number, number] = [22.8046, 86.2029];

export const ZONES = [
  "Jamshedpur Central",
  "Bistupur – Sakchi Corridor",
  "Adityapur Industrial Belt",
  "Mango – Dimna Ring",
] as const;

export const ROUTES = [
  "JSR-01 Bistupur ⇄ Mango",
  "JSR-04 Sakchi ⇄ Adityapur",
  "JSR-07 Golmuri ⇄ Kadma",
  "JSR-11 Telco ⇄ Bistupur",
  "JSR-14 Sonari ⇄ Dimna",
  "JSR-19 Jugsalai ⇄ Baridih",
] as const;

// Detection times are generated relative to page load so the feed always reads "live".
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const DETECTIONS: Detection[] = [
  {
    id: "JSR-EVT-88214",
    type: "incident",
    label: "Hit & Run — Two Wheeler",
    severity: "critical",
    lat: 22.8006,
    lng: 86.1834,
    location: "Bistupur Main Road, near Ram Mandir",
    busId: "JH05-BX-4412",
    route: ROUTES[0],
    cameraId: "CAM-FRONT-02",
    detectedAt: minutesAgo(3),
    confidence: 94.2,
    status: "unresolved",
    plate: "JH 05 CE 7841",
    speedKph: 78,
  },
  {
    id: "JSR-EVT-88209",
    type: "waterlogging",
    label: "Waterlogging — 400mm depth",
    severity: "critical",
    lat: 22.7921,
    lng: 86.2087,
    location: "Sakchi Golchakkar underpass",
    busId: "JH05-BX-2290",
    route: ROUTES[1],
    cameraId: "CAM-FRONT-01",
    detectedAt: minutesAgo(9),
    confidence: 97.6,
    status: "unresolved",
  },
  {
    id: "JSR-EVT-88198",
    type: "pothole",
    label: "Pothole cluster — 6 units",
    severity: "high",
    lat: 22.8163,
    lng: 86.2214,
    location: "Mango Bridge approach ramp",
    busId: "JH05-BX-1187",
    route: ROUTES[0],
    cameraId: "CAM-DOWN-03",
    detectedAt: minutesAgo(17),
    confidence: 91.4,
    status: "unresolved",
  },
  {
    id: "JSR-EVT-88190",
    type: "congestion",
    label: "Congestion — density 0.82",
    severity: "medium",
    lat: 22.7885,
    lng: 86.1786,
    location: "Kadma Farm Area crossing",
    busId: "JH05-BX-3341",
    route: ROUTES[2],
    cameraId: "CAM-FRONT-02",
    detectedAt: minutesAgo(21),
    confidence: 88.9,
    status: "in-progress",
  },
  {
    id: "JSR-EVT-88182",
    type: "signboard",
    label: "Signboard obscured / bent",
    severity: "low",
    lat: 22.8241,
    lng: 86.1902,
    location: "Telco Gate No. 3, NH-33 service road",
    busId: "JH05-BX-9075",
    route: ROUTES[3],
    cameraId: "CAM-SIDE-01",
    detectedAt: minutesAgo(28),
    confidence: 82.3,
    status: "unresolved",
  },
  {
    id: "JSR-EVT-88175",
    type: "incident",
    label: "Rash Driving — lane cutting",
    severity: "critical",
    lat: 22.7748,
    lng: 86.1519,
    location: "Adityapur Toll Bridge",
    busId: "JH05-BX-6620",
    route: ROUTES[1],
    cameraId: "CAM-FRONT-01",
    detectedAt: minutesAgo(36),
    confidence: 96.1,
    status: "unresolved",
    plate: "JH 05 DK 2209",
    speedKph: 92,
  },
  {
    id: "JSR-EVT-88168",
    type: "pothole",
    label: "Edge break — 1.2m",
    severity: "medium",
    lat: 22.8102,
    lng: 86.2401,
    location: "Baridih Basti Road, Sec-4",
    busId: "JH05-BX-4412",
    route: ROUTES[5],
    cameraId: "CAM-DOWN-03",
    detectedAt: minutesAgo(44),
    confidence: 86.7,
    status: "in-progress",
  },
  {
    id: "JSR-EVT-88159",
    type: "congestion",
    label: "Congestion — density 0.91",
    severity: "high",
    lat: 22.7972,
    lng: 86.1996,
    location: "Sakchi Market junction",
    busId: "JH05-BX-2290",
    route: ROUTES[5],
    cameraId: "CAM-FRONT-02",
    detectedAt: minutesAgo(52),
    confidence: 93.5,
    status: "unresolved",
  },
  {
    id: "JSR-EVT-88147",
    type: "waterlogging",
    label: "Waterlogging — 180mm depth",
    severity: "high",
    lat: 22.7829,
    lng: 86.2233,
    location: "Jugsalai Rail Crossing No. 12",
    busId: "JH05-BX-7714",
    route: ROUTES[5],
    cameraId: "CAM-FRONT-01",
    detectedAt: minutesAgo(63),
    confidence: 95.2,
    status: "unresolved",
  },
  {
    id: "JSR-EVT-88132",
    type: "pothole",
    label: "Pothole — 340mm dia",
    severity: "high",
    lat: 22.8318,
    lng: 86.2075,
    location: "Dimna Road, near Sitaramdera",
    busId: "JH05-BX-9075",
    route: ROUTES[4],
    cameraId: "CAM-DOWN-01",
    detectedAt: minutesAgo(78),
    confidence: 89.8,
    status: "unresolved",
  },
  {
    id: "JSR-EVT-88121",
    type: "incident",
    label: "Signal jump — heavy vehicle",
    severity: "critical",
    lat: 22.8067,
    lng: 86.2158,
    location: "Golmuri Circle",
    busId: "JH05-BX-1187",
    route: ROUTES[2],
    cameraId: "CAM-FRONT-02",
    detectedAt: minutesAgo(96),
    confidence: 92.7,
    status: "in-progress",
    plate: "JH 05 BQ 4417",
    speedKph: 64,
  },
  {
    id: "JSR-EVT-88110",
    type: "signboard",
    label: "Missing speed-limit board",
    severity: "low",
    lat: 22.7691,
    lng: 86.1961,
    location: "Sonari Aerodrome Road",
    busId: "JH05-BX-3341",
    route: ROUTES[4],
    cameraId: "CAM-SIDE-02",
    detectedAt: minutesAgo(118),
    confidence: 79.4,
    status: "resolved",
  },
  {
    id: "JSR-EVT-88098",
    type: "congestion",
    label: "Congestion — density 0.68",
    severity: "medium",
    lat: 22.8194,
    lng: 86.1687,
    location: "Sidhgora Chowk",
    busId: "JH05-BX-6620",
    route: ROUTES[3],
    cameraId: "CAM-FRONT-01",
    detectedAt: minutesAgo(141),
    confidence: 84.1,
    status: "resolved",
  },
  {
    id: "JSR-EVT-88085",
    type: "pothole",
    label: "Pothole cluster — 3 units",
    severity: "medium",
    lat: 22.7903,
    lng: 86.1602,
    location: "Kadma Ulidih Road",
    busId: "JH05-BX-7714",
    route: ROUTES[2],
    cameraId: "CAM-DOWN-02",
    detectedAt: minutesAgo(167),
    confidence: 87.6,
    status: "unresolved",
  },
];

export const INCIDENTS = DETECTIONS.filter((d) => d.type === "incident");

export const CONGESTION_ZONES = [
  { id: "cz-1", lat: 22.7972, lng: 86.1996, radius: 900, density: 0.91 },
  { id: "cz-2", lat: 22.8006, lng: 86.1834, radius: 700, density: 0.78 },
  { id: "cz-3", lat: 22.8163, lng: 86.2214, radius: 800, density: 0.66 },
  { id: "cz-4", lat: 22.7748, lng: 86.1519, radius: 650, density: 0.54 },
];

export const HERO_STATS = [
  { label: "Total Active Buses", value: "42", unit: "/ 48 fleet", trend: 4.8, accent: "emerald" as Accent },
  { label: "Unresolved Defects", value: "137", unit: "open tickets", trend: 12.3, accent: "amber" as Accent },
  { label: "Critical Incidents", value: "9", unit: "last 24h", trend: 22.5, accent: "rose" as Accent },
  { label: "Avg Delay", value: "07:24", unit: "min:sec", trend: -3.1, accent: "emerald" as Accent },
];

export const ROUTE_TRAVEL_TIMES = [
  { route: "JSR-01", expected: 34, actual: 47 },
  { route: "JSR-04", expected: 28, actual: 39 },
  { route: "JSR-07", expected: 22, actual: 25 },
  { route: "JSR-11", expected: 41, actual: 58 },
  { route: "JSR-14", expected: 37, actual: 42 },
  { route: "JSR-19", expected: 26, actual: 36 },
];

export const TRAFFIC_DENSITY_24H = [
  { hour: "00:00", density: 0.12, incidents: 0 },
  { hour: "01:00", density: 0.09, incidents: 1 },
  { hour: "02:00", density: 0.07, incidents: 0 },
  { hour: "03:00", density: 0.08, incidents: 0 },
  { hour: "04:00", density: 0.14, incidents: 0 },
  { hour: "05:00", density: 0.26, incidents: 1 },
  { hour: "06:00", density: 0.41, incidents: 2 },
  { hour: "07:00", density: 0.63, incidents: 3 },
  { hour: "08:00", density: 0.82, incidents: 5 },
  { hour: "09:00", density: 0.91, incidents: 4 },
  { hour: "10:00", density: 0.74, incidents: 2 },
  { hour: "11:00", density: 0.62, incidents: 1 },
  { hour: "12:00", density: 0.58, incidents: 2 },
  { hour: "13:00", density: 0.61, incidents: 1 },
  { hour: "14:00", density: 0.57, incidents: 1 },
  { hour: "15:00", density: 0.64, incidents: 2 },
  { hour: "16:00", density: 0.72, incidents: 3 },
  { hour: "17:00", density: 0.86, incidents: 4 },
  { hour: "18:00", density: 0.94, incidents: 6 },
  { hour: "19:00", density: 0.88, incidents: 5 },
  { hour: "20:00", density: 0.69, incidents: 3 },
  { hour: "21:00", density: 0.48, incidents: 2 },
  { hour: "22:00", density: 0.31, incidents: 1 },
  { hour: "23:00", density: 0.19, incidents: 1 },
];

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatStamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())} IST`;
}

export function coords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

export const SEVERITY_ACCENT: Record<Severity, Accent> = {
  critical: "rose",
  high: "amber",
  medium: "amber",
  low: "emerald",
};
