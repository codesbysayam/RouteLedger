/**
 * RouteLedger - Central Map Configuration
 *
 * Uses standard OpenStreetMap tile server (zero API keys or tokens required).
 * Provides clean, high-contrast operational rendering without promotional watermarks.
 */

export const MAP_CONFIG = {
  // Free OpenStreetMap tile server
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Required standard OSM attribution
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  
  // Tile layer options
  tileOptions: {
    maxZoom: 19,
    crossOrigin: true,
  },

  // Map viewport defaults (Continental US center)
  defaultCenter: [39.5, -98.35] as [number, number],
  defaultZoom: 5,

  // Route Polyline styling
  routeStyle: {
    color: '#2563EB', // Primary blue accent
    weight: 4,
    opacity: 0.9,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  },

  // Pin marker styling tokens
  markers: {
    origin: {
      color: '#17202A', // Dark
      label: 'Origin',
      code: 'O',
    },
    pickup: {
      color: '#2563EB', // Blue
      label: 'Pickup',
      code: 'P',
    },
    fuel: {
      color: '#B54708', // Amber
      label: 'Fuel',
      code: 'F',
    },
    rest: {
      color: '#7C3AED', // Violet
      label: 'Rest',
      code: 'R',
    },
    dropoff: {
      color: '#16803C', // Green
      label: 'Dropoff',
      code: 'D',
    },
  },
};
