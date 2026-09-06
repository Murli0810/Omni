# Urban Eye

Build a high-density, tactical command center web application called "Urban Intelligence Dashboard" for municipal transport authorities. The app processes AI camera streams from public buses to detect road defects, traffic congestion, and safety incidents in real time.



Overall Aesthetic & HUD System:

- Palette: Extreme dark mode (`bg-zinc-950`). Surface containers must use frosted glassmorphism (`bg-zinc-900/60`, `backdrop-blur-xl`, `border`, `border-zinc-800/80`, `shadow-2xl`).

- High-Density Top Navigation Bar: Include a live ticking clock, a glowing green status indicator ("● EDGE AI FLEET ONLINE - 42 BUSES ACTIVE"), city/zone selector dropdown ("Jamshedpur Central"), and a quick search trigger.

- Navigation Sidebar: Sleek collapsible sidebar with icons for Dashboard, GIS Map, Infrastructure, Analytics, and Incidents. Active link gets a glowing neon accent border.

- Typography: Inter/Sans for UI, paired with a dense monospace font (JetBrains Mono / Fira Code) for all technical data, coordinates, timestamps, vehicle plates, and confidence scores.

- Strict Color & Animation Taxonomy:

  * Critical/Incidents/Waterlogging: Neon rose (`text-rose-500`, `bg-rose-500/10`, `border-rose-500/30`) with a subtle `animate-pulse` dot on active alerts.

  * Warnings/Potholes/Signboards: Electric amber (`text-amber-400`, `bg-amber-400/10`, `border-amber-400/30`).

  * Telemetry/Vehicle Density: Cyber emerald (`text-emerald-400`, `bg-emerald-400/10`, `border-emerald-400/30`).



Page Specifications:



1. Main Dashboard (`/`):

   - Hero Stats: 4 glassmorphic cards showing Total Active Buses, Unresolved Defects, Critical Incidents, and Avg Delay (+/- % trend badges).

   - Main View: 70/30 split layout. 

     * Left (70%): Embedded interactive map container with CartoDB Dark Matter styling and custom pin markers.

     * Right (30%): Real-time live event feed using a scrollable area. Each item shows a color badge, time ago, bus ID, location, and a "View" button.



2. Full GIS Map View (`/map`):

   - Full-bleed map styled with dark tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`).

   - Floating Glassmorphic Control HUD overlay on top-right with toggle switches for map layers: "Road Hazards", "Congestion Heatmap", and "Critical Incidents".

   - Custom popup modals when clicking pins showing snapshot preview, detection confidence score bar, and GPS coordinates.



3. Infrastructure Deficiency Tracker (`/infrastructure`):

   - High-density data table with filters for Event Type, Severity, and Bus Route.

   - Table columns: ID (mono), Type (badge), Severity, Location (lat/lng), Bus ID, Detection Time, Action.

   - Interactive feature: Selecting/hovering a row highlights or centers the corresponding pin on a synchronized side-panel mini map.



4. Traffic Analytics (`/analytics`):

   - Recharts visualizers styled in dark mode with custom translucent tooltips.

   - Chart 1: Dual-bar chart comparing "Expected Travel Time" vs "Actual Travel Time" across 6 key city routes.

   - Chart 2: Area chart showing "City Traffic Density Trends" over a 24-hour timeline.



5. Incident Detail Deep-Dive (`/incidents/[id]`):

   - Split layout for forensic review of Hit-and-Run / Rash Driving events.

   - Left: Large vehicle snapshot image overlaid with a simulated AI targeting reticle/bounding box around the offending license plate, accompanied by a glowing tag "OCR CONFIDENCE: 94.2%".

   - Right: Metadata panel featuring extracted License Plate Number (large bold monospace), Timestamp, Vehicle Speed, Bus Camera ID, GPS coordinates, and an "Export Evidence PDF" button.



Technical Requirements:

- Build modular React components using Tailwind CSS and shadcn/ui primitives.

- Populate all screens with realistic mock datasets matching Indian road conditions and coordinates (e.g., Jamshedpur coordinates: 22.8046° N, 86.2029° E).

- Fully interactive with tab switching, filters, and modal popups works out of the box.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/963f5215-5486-433e-aea6-1a7f41f474e7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
