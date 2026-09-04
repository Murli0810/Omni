# Urban Intelligence Dashboard

A dark, tactical command center for municipal transport authorities in Jamshedpur, showing AI bus-camera detections: road defects, congestion, and safety incidents. All data is realistic mock data (no backend).

## Look and feel

- Near-black background with frosted glass panels, thin subtle borders, deep shadows.
- Inter for interface text, JetBrains Mono for all technical values (IDs, coordinates, timestamps, plates, confidence scores).
- Fixed colour meaning throughout: rose for critical incidents and waterlogging (with a softly pulsing dot on live alerts), amber for potholes/warnings/damaged signboards, emerald for telemetry and vehicle density.
- Top bar: ticking live clock, glowing green "EDGE AI FLEET ONLINE — 42 BUSES ACTIVE" indicator, zone selector ("Jamshedpur Central" and other zones), and a quick-search trigger opening a command palette.
- Collapsible left sidebar: Dashboard, GIS Map, Infrastructure, Analytics, Incidents; the active item gets a glowing neon accent edge.

## Pages

1. Dashboard (`/`) — four stat cards (Active Buses, Unresolved Defects, Critical Incidents, Avg Delay) with up/down trend badges; below, a 70/30 split: dark interactive map with custom colour-coded pins on the left, scrollable live event feed on the right (colour badge, time ago, bus ID, location, View button that opens the incident page).
2. GIS Map (`/map`) — full-bleed dark map; floating glass control panel top-right with toggles for Road Hazards, Congestion Heatmap, Critical Incidents; clicking a pin opens a popup card with snapshot preview, confidence score bar, and GPS coordinates.
3. Infrastructure (`/infrastructure`) — dense table (ID, Type badge, Severity, lat/lng, Bus ID, Detection Time, Action) with filters for event type, severity, and bus route; hovering or selecting a row highlights and centres that pin on a synced side mini-map.
4. Analytics (`/analytics`) — dark-styled charts with translucent tooltips: grouped bars comparing expected vs actual travel time across 6 routes, and an area chart of 24-hour city traffic density.
5. Incident detail (`/incidents/:id`) — left: large vehicle snapshot with a simulated AI targeting reticle around the number plate plus a glowing "OCR CONFIDENCE: 94.2%" tag; right: metadata panel with the plate in large monospace, timestamp, vehicle speed, bus camera ID, GPS coordinates, and an Export Evidence PDF button.

## Technical notes

- New route files: `index.tsx` (replacing the placeholder), `map.tsx`, `infrastructure.tsx`, `analytics.tsx`, `incidents.index.tsx`, `incidents.$id.tsx`, each with its own page title and description metadata.
- Shared shell (sidebar + top bar) added in `__root.tsx` around the outlet; sidebar collapse state kept in React state.
- Maps: Leaflet + react-leaflet with CartoDB Dark Matter tiles, loaded browser-only (lazy import behind a client-only wrapper) so server rendering doesn't break; congestion heatmap simulated with translucent circle overlays. Leaflet CSS loaded via a stylesheet link in the root head.
- Charts use the bundled Recharts; UI built from existing shadcn primitives (card, table, select, switch, badge, scroll-area, dialog, tooltip, sidebar).
- Design tokens (surface, rose/amber/emerald accent tokens, glow shadows, mono font variable) added to `src/styles.css`; fonts loaded via a link tag in the root head.
- Mock data centralised in `src/data/` (detections, incidents, routes, telemetry, traffic series) with Jamshedpur-area coordinates around 22.8046 N, 86.2029 E; incident snapshots generated as images.
- Export Evidence PDF triggers a client-side print/download of the evidence panel — no server work.
