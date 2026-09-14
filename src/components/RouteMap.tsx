import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { StopMarker } from '../types.ts';
import { MAP_CONFIG } from '../mapConfig.ts';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: MAP_CONFIG.defaultCenter,
        zoom: MAP_CONFIG.defaultZoom,
        zoomControl: true,
        attributionControl: true,
      });

      // Standard OpenStreetMap tile layer (100% free, zero tokens/keys required)
      L.tileLayer(MAP_CONFIG.tileUrl, {
        attribution: MAP_CONFIG.attribution,
        ...MAP_CONFIG.tileOptions,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const bounds = L.latLngBounds([]);

    // 1. Draw route polyline from OSRM road coordinates
    if (geometry && geometry.length > 0) {
      // OSRM GeoJSON format is [lon, lat]; Leaflet expects [lat, lon]
      const latLngs: L.LatLngTuple[] = geometry.map(([lon, lat]) => [lat, lon]);

      const polyline = L.polyline(latLngs, {
        color: MAP_CONFIG.routeStyle.color,
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

        let badgeBg = '#111827';
        let badgeText = 'O';
        let badgeLabel = 'Origin';

        if (isPickup) {
          badgeBg = '#2563EB';
          badgeText = 'P';
          badgeLabel = 'Cargo Pickup';
        } else if (isFuel) {
          badgeBg = '#B54708';
          badgeText = 'F';
          badgeLabel = 'Fuel Stop';
        } else if (isRest) {
          badgeBg = '#0F9D8A'; // RouteLedger Brand Teal
          badgeText = stop.stop_type === 'REST_30_MIN' ? '30m' : '10h';
          badgeLabel = stop.stop_type === 'REST_30_MIN' ? '30-Min Rest Break' : '10-Hr Off-Duty Rest';
        } else if (isDropoff) {
          badgeBg = '#16803C';
          badgeText = 'D';
          badgeLabel = 'Final Destination';
        } else if (isOrigin) {
          badgeBg = '#111827';
          badgeText = 'O';
          badgeLabel = 'Origin Terminal';
        }

        // Professional, small SVG pin icon (24x28px)
        const customIcon = L.divIcon({
          className: 'routeledger-map-pin',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" title="${badgeLabel}: ${stop.name}">
              <div style="background-color:${badgeBg}; color:#ffffff; font-family:'Geist Mono', monospace; font-size:11px; font-weight:600; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 1px 4px rgba(0,0,0,0.25);">
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
          <div style="font-family:'Source Sans 3', sans-serif; min-width:200px; max-width:240px; padding:2px;">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #E4E7EC; padding-bottom:4px; margin-bottom:6px;">
              <span style="font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:600; color:${badgeBg}; text-transform:uppercase;">
                Stop ${index + 1} • ${badgeLabel}
              </span>
              <span style="font-family:'IBM Plex Mono', monospace; font-size:10px; color:#667085;">
                ${stop.duty_status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style="font-size:13px; font-weight:600; color:#17202A; margin-bottom:6px; line-height:1.3;">
              ${stop.name}
            </div>
            <div style="font-size:11px; color:#475467; display:grid; grid-template-columns:auto 1fr; gap:3px 8px; margin-bottom:8px;">
              <span style="color:#98A2B3;">Arrival:</span> <span style="font-family:'IBM Plex Mono', monospace; color:#17202A;">${arrTimeStr}</span>
              <span style="color:#98A2B3;">Departure:</span> <span style="font-family:'IBM Plex Mono', monospace; color:#17202A;">${depTimeStr}</span>
              <span style="color:#98A2B3;">Duration:</span> <span style="color:#17202A;">${stop.duration_minutes} min</span>
            </div>
            ${
              stop.reason
                ? `<div style="font-size:11px; color:#344054; background:#F8FAFC; border:1px solid #E4E7EC; border-radius:4px; padding:4px 6px; line-height:1.3;">${stop.reason}</div>`
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
      map.fitBounds(bounds, {
        padding: [36, 36],
        maxZoom: 13,
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geometry, stops]);

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
    <div id="route-map-panel" className="flex flex-col h-[520px] lg:h-[560px] bg-white border border-[#E2E6EA] rounded-[10px] overflow-hidden shadow-xs">
      {/* Clean operational header ABOVE the map */}
      <div className="px-5 py-3.5 bg-white border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
                ROUTE OVERVIEW
              </span>
              <div className="w-5 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
            </div>
            {totalMiles !== undefined && totalMiles > 0 && (
              <>
                <span className="text-[#D1D5DB] ml-1">|</span>
                <span className="font-mono text-[13px] font-semibold text-[#111827]">
                  {totalMiles.toLocaleString(undefined, { maximumFractionDigits: 1 })} mi
                </span>
                {driveTimeStr && (
                  <>
                    <span className="text-[#D1D5DB]">·</span>
                    <span className="font-mono text-[12px] font-medium text-[#5B6470]">
                      {driveTimeStr}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
          {originName && destinationName && (
            <div className="text-[13px] text-[#111827] font-medium mt-1 flex items-center gap-1.5">
              <span className="text-[#5B6470]">{originName}</span>
              <span className="text-[#0F9D8A] font-semibold">→</span>
              <span className="text-[#111827] font-semibold">{destinationName}</span>
            </div>
          )}
        </div>

        {stops.length > 0 && (
          <div className="text-[12px] text-[#5B6470] flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              Pickup
            </span>
            {fuelCount > 0 && (
              <>
                <span className="text-[#D1D5DB]">·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B54708]" />
                  {fuelCount} fuel stop{fuelCount > 1 ? 's' : ''}
                </span>
              </>
            )}
            {restCount > 0 && (
              <>
                <span className="text-[#D1D5DB]">·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]" />
                  {restCount} rest period{restCount > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Leaflet Map Stage */}
      <div className="relative flex-1 w-full min-h-[380px] bg-[#F7F8FA]">
        <div
          id="leaflet-map-canvas"
          ref={mapContainerRef}
          className="w-full h-full min-h-[380px] outline-none"
        />

        {/* Compact floating map control in top-left */}
        {totalMiles !== undefined && totalMiles > 0 && (
          <div className="absolute top-3 left-3 z-[1000] bg-white border border-[#E2E6EA] rounded-[7px] px-3 py-1.5 shadow-xs flex items-center gap-2 text-[11px] font-mono text-[#111827] select-none">
            <span className="w-2 h-2 rounded-full bg-[#0F9D8A]" />
            <span className="font-semibold uppercase tracking-wider text-[#5B6470]">ROUTE</span>
            <span className="text-[#D1D5DB]">·</span>
            <span className="font-semibold">{totalMiles.toFixed(1)} mi</span>
            {driveTimeStr && (
              <>
                <span className="text-[#D1D5DB]">·</span>
                <span className="text-[#5B6470]">{hours}h {minutes}m</span>
              </>
            )}
            <span className="text-[#D1D5DB]">·</span>
            <span className="text-[#5B6470]">{fuelCount} stops</span>
          </div>
        )}

        {/* Minimal, quiet legend pinned at bottom-left */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white border border-[#E2E6EA] rounded-[6px] px-3 py-1.5 shadow-xs text-[11px] font-medium text-[#5B6470] flex items-center gap-3.5 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#111827] inline-block border border-white" />
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block border border-white" />
            <span>Pickup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B54708] inline-block border border-white" />
            <span>Fuel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D8A] inline-block border border-white" />
            <span>Rest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16803C] inline-block border border-white" />
            <span>Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
};

