import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, PanelHeader } from "@/components/hud/panel";
import { ROUTE_TRAVEL_TIMES, ROUTES, TRAFFIC_DENSITY_24H } from "@/data/fleet";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Traffic Analytics | Urban Intelligence Dashboard" },
      {
        name: "description",
        content:
          "Expected vs actual travel time across six city bus routes plus 24-hour city traffic density trends from edge-AI telemetry.",
      },
      { property: "og:title", content: "Traffic Analytics | Urban Intelligence Dashboard" },
      {
        property: "og:description",
        content:
          "Route delay comparison and hourly congestion trends for municipal transport planning.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const axis = {
  stroke: "#52525b",
  tick: { fill: "#a1a1aa", fontSize: 11, fontFamily: "var(--font-mono)" },
};

function HudTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/85 px-3 py-2 shadow-2xl backdrop-blur-xl">
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">{label}</p>
      <div className="mt-1.5 space-y-0.5">
        {payload.map((p: any) => (
          <p key={p.dataKey} className="font-mono text-[11px]" style={{ color: p.color }}>
            {p.name}: {p.value}
            {unit}
          </p>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Expected vs Actual Travel Time"
            meta="minutes · 6 key corridors · rolling 7-day mean"
          />
          <div className="h-[340px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ROUTE_TRAVEL_TIMES} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="route" {...axis} />
                <YAxis {...axis} />
                <Tooltip
                  cursor={{ fill: "rgba(63,63,70,0.25)" }}
                  content={<HudTooltip unit=" min" />}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                />
                <Bar dataKey="expected" name="Expected" fill="#34d399" radius={[3, 3, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#fbbf24" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader
            title="City Traffic Density Trends"
            meta="normalised density index · 24h timeline"
          />
          <div className="h-[340px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRAFFIC_DENSITY_24H}>
                <defs>
                  <linearGradient id="densityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="hour" interval={2} {...axis} />
                <YAxis domain={[0, 1]} {...axis} />
                <Tooltip content={<HudTooltip />} />
                <Area
                  type="monotone"
                  dataKey="density"
                  name="Density"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#densityFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader title="Corridor Delay Ledger" meta="derived from GPS + camera telemetry" />
        <div className="grid gap-px bg-zinc-800/60 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTE_TRAVEL_TIMES.map((r, i) => {
            const delay = r.actual - r.expected;
            const pct = ((delay / r.expected) * 100).toFixed(1);
            return (
              <div key={r.route} className="bg-zinc-900/60 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {ROUTES[i]}
                </p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="font-mono text-2xl font-semibold text-amber-400">+{delay}m</p>
                  <p className="font-mono text-[11px] text-zinc-400">{pct}% over plan</p>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-amber-400/80"
                    style={{ width: `${Math.min(100, (delay / r.expected) * 220)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
