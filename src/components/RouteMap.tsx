import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StopMarker } from '../types.ts';
import { MAP_CONFIG, MAP_LAYERS, MapLayerType } from '../mapConfig.ts';
import { Map as MapIcon, Globe, Mountain } from 'lucide-react';

// Defensive safeguard against Leaflet internal race conditions during React StrictMode / unmount
if (typeof window !== 'undefined' && L && L.DomUtil) {
  const originalGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el: any) {
    if (!el) {
      return new L.Point(0, 0);
    }
    try {
      return originalGetPosition ? originalGetPosition.call(this, el) : (el._leaflet_pos || new L.Point(0, 0));
    } catch {
      return new L.Point(0, 0);
    }
  };

  const originalSetPosition = L.DomUtil.setPosition;
  L.DomUtil.setPosition = function (el: any, point: L.Point) {
    if (!el) return;
    try {
      if (originalSetPosition) {
        originalSetPosition.call(this, el, point);
      } else {
        el._leaflet_pos = point;
      }
    } catch {
      // Ignore during unmount
    }
  };
}

interface RouteMapProps {
  geometry: [number, number][]; // [lon, lat] from OSRM GeoJSON
  stops: StopMarker[];
  totalMiles?: number;
  totalDriveHours?: number;
  originName?: string;
  destinationName?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  geometry,
  stops,
  totalMiles,
  totalDriveHours,
  originName,
  destinationName,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('standard');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize map ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom,
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: false,
        zoomAnimation: false,
      });

      // Initial tile layer
      const initialLayerDef = MAP_LAYERS[activeLayer];
      const tile = L.tileLayer(initialLayerDef.url, {
        attribution: initialLayerDef.attribution,
        maxZoom: initialLayerDef.maxZoom,
      }).addTo(map);
      tileLayerRef.current = tile;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Invalidate size immediately and after layout paint
      map.invalidateSize();
      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    const map = mapInstanceRef.current;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current && mapContainerRef.current && mapContainerRef.current.clientWidth > 0) {
        try {
          mapInstanceRef.current.invalidateSize({ debounceMoveEvents: true });
        } catch {
          // Safe catch
        }
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch {
          // Safe catch
        }
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersLayerRef.current = null;
        routeLayerRef.current = null;
      }
    };
  }, []);

  // 2. Reactively switch tile layer when activeLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layerDef = MAP_LAYERS[activeLayer];
    if (!layerDef) return;

    // Remove old tile layer
    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch {
        // Safe catch
      }
    }

    // Add new tile layer
    const newTile = L.tileLayer(layerDef.url, {
      attribution: layerDef.attribution,
      maxZoom: layerDef.maxZoom,
    }).addTo(map);

    // Keep base tiles below vectors and markers
    try {
      newTile.bringToBack();
    } catch {
      // Safe catch
    }

    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // 3. Reactively update polyline route and stop markers when geometry/stops change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous polyline
    if (routeLayerRef.current) {
      try {
        map.removeLayer(routeLayerRef.current);
      } catch {
        // Safe catch
      }
      routeLayerRef.current = null;
    }

    // Clear previous markers
    if (markersLayerRef.current) {
      try {
        markersLayerRef.current.clearLayers();
      } catch {
        // Safe catch
      }
    }

    const bounds = L.latLngBounds([]);

    // 1. Draw route polyline from OSRM road coordinates
    if (geometry && geometry.length > 0) {
      // OSRM GeoJSON format is [lon, lat]; Leaflet expects [lat, lon]
      const latLngs: L.LatLngTuple[] = geometry.map(([lon, lat]) => [lat, lon]);

      // For satellite imagery, use a slightly brighter border/color for maximum visibility
      const polyline = L.polyline(latLngs, {
        color: activeLayer === 'satellite' ? '#38BDF8' : MAP_CONFIG.routeStyle.color,
        weight: MAP_CONFIG.routeStyle.weight,
        opacity: MAP_CONFIG.routeStyle.opacity,
        lineCap: MAP_CONFIG.routeStyle.lineCap,
        lineJoin: MAP_CONFIG.routeStyle.lineJoin,
      }).addTo(map);

      routeLayerRef.current = polyline;
      latLngs.forEach((ll) => bounds.extend(ll));
    }

    // 2. Render discrete, professional SVG pins
    if (stops && stops.length > 0 && markersLayerRef.current) {
      stops.forEach((stop, index) => {
        if (stop.latitude === undefined || stop.longitude === undefined) return;

        const isOrigin = index === 0 && stop.stop_type !== 'PICKUP';
        const isPickup = stop.stop_type === 'PICKUP';
        const isFuel = stop.stop_type === 'FUEL';
        const isRest =
          stop.stop_type === 'REST_10_HR' ||
          stop.stop_type === 'REST_30_MIN' ||
          stop.stop_type === 'RESTART_34_HR';
        const isDropoff = stop.stop_type === 'DROPOFF';

        let badgeBg = '#0891B2'; // Cyan
        let badgeText = 'O';
        let badgeLabel = 'Origin';

        if (isPickup) {
          badgeBg = '#2563EB'; // Blue
          badgeText = 'P';
          badgeLabel = 'Cargo Pickup';
        } else if (isFuel) {
          badgeBg = '#D97706'; // Amber
          badgeText = 'F';
          badgeLabel = 'Fuel Stop';
        } else if (isRest) {
          badgeBg = '#0F9F8F'; // Teal
          badgeText = stop.stop_type === 'REST_30_MIN' ? '30m' : '10h';
          badgeLabel = stop.stop_type === 'REST_30_MIN' ? '30-Min Rest Break' : '10-Hr Off-Duty Rest';
        } else if (isDropoff) {
          badgeBg = '#6366F1'; // Indigo
          badgeText = 'D';
          badgeLabel = 'Final Destination';
        } else if (isOrigin) {
          badgeBg = '#0891B2'; // Cyan
          badgeText = 'O';
          badgeLabel = 'Origin Terminal';
        }

        // Clean, compact professional SVG pin icon (24x29px)
        const customIcon = L.divIcon({
          className: 'routeledger-map-pin',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" title="${badgeLabel}: ${stop.name}">
              <div style="background-color:${badgeBg}; color:#ffffff; font-family:'Geist Mono', monospace; font-size:11px; font-weight:700; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(15,23,42,0.22);">
                ${badgeText}
              </div>
              <div style="width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:5px solid ${badgeBg}; margin-top:-1px;"></div>
            </div>
          `,
          iconSize: [24, 29],
          iconAnchor: [12, 29],
          popupAnchor: [0, -29],
        });

        const arrTimeStr = stop.arrival_time
          ? new Date(stop.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--:--';
        const depTimeStr = stop.departure_time
          ? new Date(stop.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '--:--';

        const popupContent = `
          <div style="font-family:'Geist', sans-serif; min-width:210px; max-width:250px; padding:4px; background:#ffffff; color:#172033; border-radius:6px;">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #E2E8F0; padding-bottom:4px; margin-bottom:6px;">
              <span style="font-family:'Geist Mono', monospace; font-size:10.5px; font-weight:700; color:${badgeBg}; text-transform:uppercase;">
                Stop ${index + 1} • ${badgeLabel}
              </span>
              <span style="font-family:'Geist Mono', monospace; font-size:10px; color:#526174;">
                ${(stop.duty_status || '').replace(/_/g, ' ')}
              </span>
            </div>
            <div style="font-size:13px; font-weight:600; color:#172033; margin-bottom:6px; line-height:1.3;">
              ${stop.name}
            </div>
            <div style="font-size:11.5px; color:#526174; display:grid; grid-template-columns:auto 1fr; gap:3px 8px; margin-bottom:6px;">
              <span style="color:#7A8798;">Arrival:</span> <span style="font-family:'Geist Mono', monospace; font-weight:600; color:#172033;">${arrTimeStr}</span>
              <span style="color:#7A8798;">Departure:</span> <span style="font-family:'Geist Mono', monospace; font-weight:600; color:#172033;">${depTimeStr}</span>
              <span style="color:#7A8798;">Duration:</span> <span style="color:#172033; font-weight:600;">${stop.duration_minutes} min</span>
            </div>
            ${
              stop.reason
                ? `<div style="font-size:11px; color:#526174; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:4px; padding:4px 6px; line-height:1.3;">${stop.reason}</div>`
                : ''
            }
          </div>
        `;

        const marker = L.marker([stop.latitude, stop.longitude], { icon: customIcon })
          .bindPopup(popupContent);

        markersLayerRef.current?.addLayer(marker);
        bounds.extend([stop.latitude, stop.longitude]);
      });
    }

    if (bounds.isValid()) {
      try {
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 13,
          animate: false,
        });
      } catch {
        // Safe catch
      }
    }
  }, [geometry, stops, activeLayer]);

  // Derive counts for clean header summary
  const safeStops = stops || [];
  const fuelCount = safeStops.filter((s) => s.stop_type === 'FUEL').length;
  const restCount = safeStops.filter(
    (s) => s.stop_type === 'REST_10_HR' || s.stop_type === 'REST_30_MIN' || s.stop_type === 'RESTART_34_HR'
  ).length;

  const hours = totalDriveHours ? Math.floor(totalDriveHours) : 0;
  const minutes = totalDriveHours ? Math.round((totalDriveHours - hours) * 60) : 0;
  const driveTimeStr = totalDriveHours ? `${hours}h ${minutes}m driving` : '';

  return (
    <div id="route-map-panel" className="relative flex flex-col h-[520px] min-h-[420px] w-full bg-white border border-[#D9E2EC] rounded-[10px] overflow-hidden shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
      {/* 3px Top Accent Line: Professional Blue */}
      <div className="h-[3px] w-full bg-[#2563EB] shrink-0" />

      {/* Operational header ABOVE the map: Light surface */}
      <div className="px-4 sm:px-5 py-2.5 bg-[#F8FAFC] border-b border-[#D9E2EC] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="text-[11px] font-bold text-[#2563EB] tracking-[0.08em] uppercase">
                ROUTE CORRIDOR &amp; STOPS
              </span>
            </div>
            {totalMiles !== undefined && totalMiles > 0 && (
              <>
                <span className="text-[#CBD5E1]">|</span>
                <span className="font-mono text-[12.5px] font-bold text-[#172033]">
                  {totalMiles.toLocaleString(undefined, { maximumFractionDigits: 1 })} mi
                </span>
                {driveTimeStr && (
                  <>
                    <span className="text-[#CBD5E1]">·</span>
                    <span className="font-mono text-[12px] font-semibold text-[#526174]">
                      {driveTimeStr}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
          {originName && destinationName && (
            <div className="text-[13px] font-medium mt-0.5 flex items-center gap-2">
              <span className="text-[#0891B2] font-semibold">{originName}</span>
              <span className="text-[#2563EB] font-bold">→</span>
              <span className="text-[#6366F1] font-semibold">{destinationName}</span>
            </div>
          )}
        </div>

        {/* Layer Toggle Component */}
        <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#D9E2EC] p-1 rounded-lg shadow-xs">
          <button
            type="button"
            onClick={() => setActiveLayer('standard')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'standard'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9]'
            }`}
            title="Standard street map view"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Standard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('satellite')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'satellite'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9]'
            }`}
            title="High-resolution satellite view"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('terrain')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeLayer === 'terrain'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#526174] hover:text-[#172033] hover:bg-[#F1F5F9]'
            }`}
            title="Topographical terrain view"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Stage */}
      <div className="relative flex-1 w-full min-h-[380px] bg-[#EEF3F8] overflow-hidden">
        <div
          id="leaflet-map-canvas"
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full outline-none"
        />

        {/* Small technical badge in top-right: OSRM ROUTE ENGINE */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#CBD5E1] rounded-[6px] px-2.5 py-1 shadow-[0_4px_14px_rgba(15,23,42,0.10)] flex items-center gap-1.5 text-[11px] font-mono text-[#172033] select-none">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="font-semibold tracking-wider text-[#172033]">OSRM ROUTE ENGINE</span>
        </div>

        {/* Compact floating map control in top-left */}
        {totalMiles !== undefined && totalMiles > 0 && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-[#CBD5E1] rounded-[6px] px-3 py-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.10)] flex items-center gap-2 text-[11px] font-mono text-[#172033] select-none">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="font-bold uppercase tracking-wider text-[#2563EB]">CORRIDOR</span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="font-bold text-[#172033]">{totalMiles.toFixed(1)} mi</span>
            {driveTimeStr && (
              <>
                <span className="text-[#CBD5E1]">·</span>
                <span className="text-[#526174] font-medium">{hours}h {minutes}m</span>
              </>
            )}
            <span className="text-[#CBD5E1]">·</span>
            <span className="text-[#7A8798]">{fuelCount} stops</span>
          </div>
        )}

        {/* Semantic Color Legend pinned at bottom-left */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/96 backdrop-blur-md border border-[#CBD5E1] rounded-[6px] px-3 py-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.10)] text-[11px] font-semibold text-[#526174] flex items-center gap-3 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0891B2] inline-block border border-white shadow-xs" />
            <span className="text-[#172033]">Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block border border-white shadow-xs" />
            <span className="text-[#172033]">Pickup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F9F8F] inline-block border border-white shadow-xs" />
            <span className="text-[#172033]">Break</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block border border-white shadow-xs" />
            <span className="text-[#172033]">Fuel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] inline-block border border-white shadow-xs" />
            <span className="text-[#172033]">Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
};


