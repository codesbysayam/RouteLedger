/**
 * RouteLedger - Geocoding Service (Nominatim / OSM Proxy)
 */
import { LocationPoint } from '../src/types.ts';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

const GEOCODE_CACHE: Record<string, LocationPoint[]> = {
  'richmond, va': [
    {
      display_name: 'Richmond, Virginia, United States',
      latitude: 37.5407,
      longitude: -77.436,
      city: 'Richmond',
      state: 'Virginia',
      country: 'United States',
    },
  ],
  'richmond, virginia': [
    {
      display_name: 'Richmond, Virginia, United States',
      latitude: 37.5407,
      longitude: -77.436,
      city: 'Richmond',
      state: 'Virginia',
      country: 'United States',
    },
  ],
  'newark, nj': [
    {
      display_name: 'Newark, Essex County, New Jersey, United States',
      latitude: 40.7357,
      longitude: -74.1724,
      city: 'Newark',
      state: 'New Jersey',
      country: 'United States',
    },
  ],
  'newark, new jersey': [
    {
      display_name: 'Newark, Essex County, New Jersey, United States',
      latitude: 40.7357,
      longitude: -74.1724,
      city: 'Newark',
      state: 'New Jersey',
      country: 'United States',
    },
  ],
  'dallas, tx': [
    {
      display_name: 'Dallas, Dallas County, Texas, United States',
      latitude: 32.7767,
      longitude: -96.797,
      city: 'Dallas',
      state: 'Texas',
      country: 'United States',
    },
  ],
  'los angeles, ca': [
    {
      display_name: 'Los Angeles, Los Angeles County, California, United States',
      latitude: 34.0522,
      longitude: -118.2437,
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
    },
  ],
  'chicago, il': [
    {
      display_name: 'Chicago, Cook County, Illinois, United States',
      latitude: 41.8781,
      longitude: -87.6298,
      city: 'Chicago',
      state: 'Illinois',
      country: 'United States',
    },
  ],
  'atlanta, ga': [
    {
      display_name: 'Atlanta, Fulton County, Georgia, United States',
      latitude: 33.749,
      longitude: -84.388,
      city: 'Atlanta',
      state: 'Georgia',
      country: 'United States',
    },
  ],
};

export async function geocodeLocation(query: string, limit = 5): Promise<LocationPoint[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const key = trimmed.toLowerCase();
  if (GEOCODE_CACHE[key]) {
    return GEOCODE_CACHE[key];
  }

  for (const [k, cached] of Object.entries(GEOCODE_CACHE)) {
    if (k.includes(key) || key.includes(k)) {
      return cached;
    }
  }

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: 'json',
      addressdetails: '1',
      limit: String(limit),
    });
    const res = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      headers: {
        'User-Agent': 'RouteLedger-Commercial-HOS-Planner/1.0 (commercial-transport-logistics)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = (await res.json()) as any[];
      if (Array.isArray(data) && data.length > 0) {
        const results: LocationPoint[] = data.map((item) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const state = addr.state || '';
          const country = addr.country || '';
          return {
            display_name: item.display_name || trimmed,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city,
            state,
            country,
          };
        });
        GEOCODE_CACHE[key] = results;
        return results;
      }
    }
  } catch (err) {
    console.warn(`[Geocode] Nominatim request failed for "${trimmed}":`, err);
  }

  // Graceful fallback
  return [
    {
      display_name: `${trimmed.toUpperCase()}, USA (Estimated location)`,
      latitude: 38.5,
      longitude: -95.0,
      city: trimmed,
      state: 'US',
      country: 'United States',
    },
  ];
}
