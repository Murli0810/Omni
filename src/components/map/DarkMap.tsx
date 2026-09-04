import { Suspense, lazy, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { MapViewProps } from "./MapView";

const MapView = lazy(() => import("./MapView"));

function MapSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-zinc-950">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">
        ● initialising gis tiles
      </span>
    </div>
  );
}

/** Browser-only map wrapper: Leaflet touches window, so it never renders on the server. */
export function DarkMap({ className, ...props }: MapViewProps & { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={cn("relative size-full overflow-hidden bg-zinc-950", className)}>
      {mounted ? (
        <Suspense fallback={<MapSkeleton />}>
          <MapView {...props} />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
}
