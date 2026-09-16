/**
 * RouteLedger - Central Map Configuration
 *
 * Provides standard, satellite, and terrain raster tile layers (100% free, zero tokens/keys required).
 * Clean, high-contrast, authentic navigation rendering with proper attribution.
 */

export type MapLayerType = 'standard' | 'satellite' | 'terrain';

export interface MapLayerDefinition {
  id: MapLayerType;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const MAP_LAYERS: Record<MapLayerType, MapLayerDefinition> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  terrain: {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey',
    maxZoom: 18,
  },
};

export const MAP_CONFIG = {
  // Default layer
  layers: MAP_LAYERS,
  defaultLayer: 'standard' as MapLayerType,
  tileUrl: MAP_LAYERS.standard.url,
  attribution: MAP_LAYERS.standard.attribution,
  
  // Tile layer options
  tileOptions: {
    maxZoom: 19,
    crossOrigin: true,
  },

  // Map viewport defaults (Continental US center)
  defaultCenter: [39.5, -98.35] as [number, number],
  defaultZoom: 5,

  // Route Polyline styling - Professional crisp blue corridor
  routeStyle: {
    color: '#2563EB', // Professional Blue
    weight: 5,
    opacity: 0.9,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  },

  // Pin marker styling tokens with clean light semantic palette
  markers: {
    origin: {
      color: '#0891B2', // Cyan
      label: 'Origin',
      code: 'O',
    },
    pickup: {
      color: '#2563EB', // Blue
      label: 'Pickup',
      code: 'P',
    },
    fuel: {
      color: '#D97706', // Amber
      label: 'Fuel Stop',
      code: 'F',
    },
    rest: {
      color: '#0F9F8F', // Teal
      label: 'Rest / Break',
      code: 'B',
    },
    dropoff: {
      color: '#6366F1', // Indigo
      label: 'Destination',
      code: 'D',
    },
  },
};


