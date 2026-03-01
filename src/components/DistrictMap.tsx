"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapData } from "@/lib/types";
import { Loader2, AlertCircle } from "lucide-react";

// Fix Leaflet default marker icon paths (webpack issue)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Child component to fit map to boundary bounds
function FitBounds({ geojson }: { geojson: GeoJSON.Feature | null }) {
  const map = useMap();

  useEffect(() => {
    if (geojson) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer = L.geoJSON(geojson as any);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch (err) {
        console.error("Failed to fit bounds:", err);
      }
    }
  }, [geojson, map]);

  return null;
}

interface DistrictMapProps {
  mapData: MapData;
}

export default function DistrictMap({ mapData }: DistrictMapProps) {
  const [boundary, setBoundary] = useState<GeoJSON.Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBoundary = async () => {
      if (!mapData.boundaryQuery) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/district-boundary?q=${encodeURIComponent(mapData.boundaryQuery)}`
        );

        if (res.ok) {
          const data = await res.json();
          if (data.geojson) {
            setBoundary(data.geojson);
          }
        }
      } catch (err) {
        console.error("Failed to fetch district boundary:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBoundary();
  }, [mapData.boundaryQuery]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          District Map{mapData.label ? ` — ${mapData.label}` : ""}
        </p>
        {loading && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading boundary...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <AlertCircle className="w-3 h-3" />
            Boundary unavailable
          </div>
        )}
      </div>
      <div
        className="relative rounded-lg overflow-hidden border border-border"
        style={{ height: "320px" }}
      >
        <MapContainer
          center={[mapData.lat, mapData.lng]}
          zoom={mapData.zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {boundary && (
            <>
              <GeoJSON
                data={boundary as GeoJSON.Feature}
                style={{
                  color: "#272560",
                  weight: 3,
                  opacity: 0.85,
                  fillColor: "#272560",
                  fillOpacity: 0.08,
                  dashArray: "",
                }}
              />
              <FitBounds geojson={boundary} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
