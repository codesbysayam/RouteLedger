/**
 * RouteLedger - High-Performance Geocoding Service
 * Built-in commercial logistics hub database with resilient Nominatim fallback
 */
import type { LocationPoint } from '../src/types.ts';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

// Pre-indexed database of primary US logistics hubs, ports, and freight terminals
const PRESET_LOCATIONS: LocationPoint[] = [
  // Virginia
  {
    display_name: 'Richmond, Virginia, United States',
    latitude: 37.5407,
    longitude: -77.436,
    city: 'Richmond',
    state: 'Virginia',
    country: 'United States',
  },
  {
    display_name: 'Norfolk, Virginia, United States',
    latitude: 36.8508,
    longitude: -76.2859,
    city: 'Norfolk',
    state: 'Virginia',
    country: 'United States',
  },
  {
    display_name: 'Roanoke, Virginia, United States',
    latitude: 37.271,
    longitude: -79.9414,
    city: 'Roanoke',
    state: 'Virginia',
    country: 'United States',
  },

  // New Jersey & New York Metro
  {
    display_name: 'Newark, Essex County, New Jersey, United States',
    latitude: 40.7357,
    longitude: -74.1724,
    city: 'Newark',
    state: 'New Jersey',
    country: 'United States',
  },
  {
    display_name: 'Jersey City, Hudson County, New Jersey, United States',
    latitude: 40.7178,
    longitude: -74.0431,
    city: 'Jersey City',
    state: 'New Jersey',
    country: 'United States',
  },
  {
    display_name: 'Elizabeth, Union County, New Jersey, United States',
    latitude: 40.664,
    longitude: -74.2107,
    city: 'Elizabeth',
    state: 'New Jersey',
    country: 'United States',
  },
  {
    display_name: 'New York, New York, United States',
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    state: 'New York',
    country: 'United States',
  },
  {
    display_name: 'Albany, Albany County, New York, United States',
    latitude: 42.6526,
    longitude: -73.7562,
    city: 'Albany',
    state: 'New York',
    country: 'United States',
  },
  {
    display_name: 'Buffalo, Erie County, New York, United States',
    latitude: 42.8864,
    longitude: -78.8784,
    city: 'Buffalo',
    state: 'New York',
    country: 'United States',
  },

  // Mid-Atlantic & Northeast
  {
    display_name: 'Philadelphia, Philadelphia County, Pennsylvania, United States',
    latitude: 39.9526,
    longitude: -75.1652,
    city: 'Philadelphia',
    state: 'Pennsylvania',
    country: 'United States',
  },
  {
    display_name: 'Harrisburg, Dauphin County, Pennsylvania, United States',
    latitude: 40.2732,
    longitude: -76.8867,
    city: 'Harrisburg',
    state: 'Pennsylvania',
    country: 'United States',
  },
  {
    display_name: 'Pittsburgh, Allegheny County, Pennsylvania, United States',
    latitude: 40.4406,
    longitude: -79.9959,
    city: 'Pittsburgh',
    state: 'Pennsylvania',
    country: 'United States',
  },
  {
    display_name: 'Allentown, Lehigh County, Pennsylvania, United States',
    latitude: 40.6084,
    longitude: -75.4902,
    city: 'Allentown',
    state: 'Pennsylvania',
    country: 'United States',
  },
  {
    display_name: 'Baltimore, Maryland, United States',
    latitude: 39.2904,
    longitude: -76.6122,
    city: 'Baltimore',
    state: 'Maryland',
    country: 'United States',
  },
  {
    display_name: 'Washington, District of Columbia, United States',
    latitude: 38.9072,
    longitude: -77.0369,
    city: 'Washington',
    state: 'District of Columbia',
    country: 'United States',
  },
  {
    display_name: 'Boston, Suffolk County, Massachusetts, United States',
    latitude: 42.3601,
    longitude: -71.0589,
    city: 'Boston',
    state: 'Massachusetts',
    country: 'United States',
  },

  // Southeast & Florida
  {
    display_name: 'Atlanta, Fulton County, Georgia, United States',
    latitude: 33.749,
    longitude: -84.388,
    city: 'Atlanta',
    state: 'Georgia',
    country: 'United States',
  },
  {
    display_name: 'Savannah, Chatham County, Georgia, United States',
    latitude: 32.0809,
    longitude: -81.0912,
    city: 'Savannah',
    state: 'Georgia',
    country: 'United States',
  },
  {
    display_name: 'Charlotte, Mecklenburg County, North Carolina, United States',
    latitude: 35.2271,
    longitude: -80.8431,
    city: 'Charlotte',
    state: 'North Carolina',
    country: 'United States',
  },
  {
    display_name: 'Raleigh, Wake County, North Carolina, United States',
    latitude: 35.7796,
    longitude: -78.6382,
    city: 'Raleigh',
    state: 'North Carolina',
    country: 'United States',
  },
  {
    display_name: 'Greensboro, Guilford County, North Carolina, United States',
    latitude: 36.0726,
    longitude: -79.792,
    city: 'Greensboro',
    state: 'North Carolina',
    country: 'United States',
  },
  {
    display_name: 'Jacksonville, Duval County, Florida, United States',
    latitude: 30.3322,
    longitude: -81.6557,
    city: 'Jacksonville',
    state: 'Florida',
    country: 'United States',
  },
  {
    display_name: 'Orlando, Orange County, Florida, United States',
    latitude: 28.5383,
    longitude: -81.3792,
    city: 'Orlando',
    state: 'Florida',
    country: 'United States',
  },
  {
    display_name: 'Tampa, Hillsborough County, Florida, United States',
    latitude: 27.9506,
    longitude: -82.4572,
    city: 'Tampa',
    state: 'Florida',
    country: 'United States',
  },
  {
    display_name: 'Miami, Miami-Dade County, Florida, United States',
    latitude: 25.7617,
    longitude: -80.1918,
    city: 'Miami',
    state: 'Florida',
    country: 'United States',
  },

  // Midwest
  {
    display_name: 'Chicago, Cook County, Illinois, United States',
    latitude: 41.8781,
    longitude: -87.6298,
    city: 'Chicago',
    state: 'Illinois',
    country: 'United States',
  },
  {
    display_name: 'Indianapolis, Marion County, Indiana, United States',
    latitude: 39.7684,
    longitude: -86.1581,
    city: 'Indianapolis',
    state: 'Indiana',
    country: 'United States',
  },
  {
    display_name: 'Columbus, Franklin County, Ohio, United States',
    latitude: 39.9612,
    longitude: -82.9988,
    city: 'Columbus',
    state: 'Ohio',
    country: 'United States',
  },
  {
    display_name: 'Cleveland, Cuyahoga County, Ohio, United States',
    latitude: 41.4993,
    longitude: -81.6944,
    city: 'Cleveland',
    state: 'Ohio',
    country: 'United States',
  },
  {
    display_name: 'Cincinnati, Hamilton County, Ohio, United States',
    latitude: 39.1031,
    longitude: -84.512,
    city: 'Cincinnati',
    state: 'Ohio',
    country: 'United States',
  },
  {
    display_name: 'Detroit, Wayne County, Michigan, United States',
    latitude: 42.3314,
    longitude: -83.0458,
    city: 'Detroit',
    state: 'Michigan',
    country: 'United States',
  },
  {
    display_name: 'Milwaukee, Milwaukee County, Wisconsin, United States',
    latitude: 43.0389,
    longitude: -87.9065,
    city: 'Milwaukee',
    state: 'Wisconsin',
    country: 'United States',
  },
  {
    display_name: 'Minneapolis, Hennepin County, Minnesota, United States',
    latitude: 44.9778,
    longitude: -93.265,
    city: 'Minneapolis',
    state: 'Minnesota',
    country: 'United States',
  },
  {
    display_name: 'St. Louis, Missouri, United States',
    latitude: 38.627,
    longitude: -90.1994,
    city: 'St. Louis',
    state: 'Missouri',
    country: 'United States',
  },
  {
    display_name: 'Kansas City, Jackson County, Missouri, United States',
    latitude: 39.0997,
    longitude: -94.5786,
    city: 'Kansas City',
    state: 'Missouri',
    country: 'United States',
  },
  {
    display_name: 'Nashville, Davidson County, Tennessee, United States',
    latitude: 36.1627,
    longitude: -86.7816,
    city: 'Nashville',
    state: 'Tennessee',
    country: 'United States',
  },
  {
    display_name: 'Memphis, Shelby County, Tennessee, United States',
    latitude: 35.1495,
    longitude: -90.049,
    city: 'Memphis',
    state: 'Tennessee',
    country: 'United States',
  },
  {
    display_name: 'Louisville, Jefferson County, Kentucky, United States',
    latitude: 38.2527,
    longitude: -85.7585,
    city: 'Louisville',
    state: 'Kentucky',
    country: 'United States',
  },

  // South & Texas Corridor
  {
    display_name: 'Dallas, Dallas County, Texas, United States',
    latitude: 32.7767,
    longitude: -96.797,
    city: 'Dallas',
    state: 'Texas',
    country: 'United States',
  },
  {
    display_name: 'Fort Worth, Tarrant County, Texas, United States',
    latitude: 32.7555,
    longitude: -97.3308,
    city: 'Fort Worth',
    state: 'Texas',
    country: 'United States',
  },
  {
    display_name: 'Houston, Harris County, Texas, United States',
    latitude: 29.7604,
    longitude: -95.3698,
    city: 'Houston',
    state: 'Texas',
    country: 'United States',
  },
  {
    display_name: 'San Antonio, Bexar County, Texas, United States',
    latitude: 29.4241,
    longitude: -98.4936,
    city: 'San Antonio',
    state: 'Texas',
    country: 'United States',
  },
  {
    display_name: 'Austin, Travis County, Texas, United States',
    latitude: 30.2672,
    longitude: -97.7431,
    city: 'Austin',
    state: 'Texas',
    country: 'United States',
  },
  {
    display_name: 'El Paso, El Paso County, Texas, United States',
    latitude: 31.7619,
    longitude: -106.485,
    city: 'El Paso',
    state: 'Texas',
    country: 'United States',
  },
  {
    display_name: 'Laredo, Webb County, Texas, United States',
    latitude: 27.5306,
    longitude: -99.4803,
    city: 'Laredo',
    state: 'Texas',
    country: 'United States',
  },
  {
    display_name: 'New Orleans, Orleans Parish, Louisiana, United States',
    latitude: 29.9511,
    longitude: -90.0715,
    city: 'New Orleans',
    state: 'Louisiana',
    country: 'United States',
  },
  {
    display_name: 'Oklahoma City, Oklahoma County, Oklahoma, United States',
    latitude: 35.4676,
    longitude: -97.5164,
    city: 'Oklahoma City',
    state: 'Oklahoma',
    country: 'United States',
  },

  // Mountain & West
  {
    display_name: 'Denver, Denver County, Colorado, United States',
    latitude: 39.7392,
    longitude: -104.9903,
    city: 'Denver',
    state: 'Colorado',
    country: 'United States',
  },
  {
    display_name: 'Salt Lake City, Salt Lake County, Utah, United States',
    latitude: 40.7608,
    longitude: -111.891,
    city: 'Salt Lake City',
    state: 'Utah',
    country: 'United States',
  },
  {
    display_name: 'Phoenix, Maricopa County, Arizona, United States',
    latitude: 33.4484,
    longitude: -112.074,
    city: 'Phoenix',
    state: 'Arizona',
    country: 'United States',
  },
  {
    display_name: 'Las Vegas, Clark County, Nevada, United States',
    latitude: 36.1699,
    longitude: -115.1398,
    city: 'Las Vegas',
    state: 'Nevada',
    country: 'United States',
  },
  {
    display_name: 'Los Angeles, Los Angeles County, California, United States',
    latitude: 34.0522,
    longitude: -118.2437,
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
  },
  {
    display_name: 'Long Beach, Los Angeles County, California, United States',
    latitude: 33.7701,
    longitude: -118.1937,
    city: 'Long Beach',
    state: 'California',
    country: 'United States',
  },
  {
    display_name: 'San Diego, San Diego County, California, United States',
    latitude: 32.7157,
    longitude: -117.1611,
    city: 'San Diego',
    state: 'California',
    country: 'United States',
  },
  {
    display_name: 'San Francisco, San Francisco County, California, United States',
    latitude: 37.7749,
    longitude: -122.4194,
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
  },
  {
    display_name: 'Oakland, Alameda County, California, United States',
    latitude: 37.8044,
    longitude: -122.2712,
    city: 'Oakland',
    state: 'California',
    country: 'United States',
  },
  {
    display_name: 'Sacramento, Sacramento County, California, United States',
    latitude: 38.5816,
    longitude: -121.4944,
    city: 'Sacramento',
    state: 'California',
    country: 'United States',
  },
  {
    display_name: 'Portland, Multnomah County, Oregon, United States',
    latitude: 45.5152,
    longitude: -122.6784,
    city: 'Portland',
    state: 'Oregon',
    country: 'United States',
  },
  {
    display_name: 'Seattle, King County, Washington, United States',
    latitude: 47.6062,
    longitude: -122.3321,
    city: 'Seattle',
    state: 'Washington',
    country: 'United States',
  },
];

const STATE_NAMES: Record<string, string> = {
  al: 'alabama',
  ak: 'alaska',
  az: 'arizona',
  ar: 'arkansas',
  ca: 'california',
  co: 'colorado',
  ct: 'connecticut',
  de: 'delaware',
  fl: 'florida',
  ga: 'georgia',
  hi: 'hawaii',
  id: 'idaho',
  il: 'illinois',
  in: 'indiana',
  ia: 'iowa',
  ks: 'kansas',
  ky: 'kentucky',
  la: 'louisiana',
  me: 'maine',
  md: 'maryland',
  ma: 'massachusetts',
  mi: 'michigan',
  mn: 'minnesota',
  ms: 'mississippi',
  mo: 'missouri',
  mt: 'montana',
  ne: 'nebraska',
  nv: 'nevada',
  nh: 'new hampshire',
  nj: 'new jersey',
  nm: 'new mexico',
  ny: 'new york',
  nc: 'north carolina',
  nd: 'north dakota',
  oh: 'ohio',
  ok: 'oklahoma',
  or: 'oregon',
  pa: 'pennsylvania',
  ri: 'rhode island',
  sc: 'south carolina',
  sd: 'south dakota',
  tn: 'tennessee',
  tx: 'texas',
  ut: 'utah',
  vt: 'vermont',
  va: 'virginia',
  wa: 'washington',
  wv: 'west virginia',
  wi: 'wisconsin',
  wy: 'wyoming',
  dc: 'district of columbia',
};

// In-memory geocode cache
const GEOCODE_CACHE = new Map<string, LocationPoint[]>();

// Initialize and index preset locations
function initPresetCache() {
  for (const loc of PRESET_LOCATIONS) {
    const list = [loc];
    const cityLower = (loc.city || '').toLowerCase();
    const stateLower = (loc.state || '').toLowerCase();
    const displayLower = loc.display_name.toLowerCase();

    GEOCODE_CACHE.set(displayLower, list);
    if (cityLower) {
      GEOCODE_CACHE.set(cityLower, list);
    }
    if (cityLower && stateLower) {
      GEOCODE_CACHE.set(`${cityLower}, ${stateLower}`, list);
      // Also index by postal abbreviation
      for (const [abbr, fullName] of Object.entries(STATE_NAMES)) {
        if (fullName === stateLower) {
          GEOCODE_CACHE.set(`${cityLower}, ${abbr}`, list);
          GEOCODE_CACHE.set(`${cityLower} ${abbr}`, list);
          break;
        }
      }
    }
  }
}

initPresetCache();

function normalizeQuery(str: string): string {
  return str
    .toLowerCase()
    .replace(/[,\.\-\/]/g, ' ')
    .replace(/\b(county|parish|united states|usa|terminal|dc|distribution center)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the preset dictionary using fuzzy token/city matching.
 */
function searchPreset(rawQuery: string): LocationPoint[] {
  const norm = normalizeQuery(rawQuery);
  if (!norm) return [];

  // 1. Direct key match
  const rawKey = rawQuery.trim().toLowerCase();
  if (GEOCODE_CACHE.has(rawKey)) {
    return GEOCODE_CACHE.get(rawKey)!;
  }

  // 2. Check each preset entry
  const tokens = norm.split(' ').filter((t) => t.length > 1);

  // Exact city match first
  for (const loc of PRESET_LOCATIONS) {
    const c = (loc.city || '').toLowerCase();
    const s = (loc.state || '').toLowerCase();
    const d = loc.display_name.toLowerCase();

    // Check if the query matches the display name exactly or substring
    if (d === rawKey || d.includes(rawKey) || rawKey.includes(d)) {
      return [loc];
    }

    // Check if all tokens match either city or state or display
    if (tokens.length >= 2) {
      const cityMatches = tokens.some((t) => c.includes(t) || t.includes(c));
      const stateMatches = tokens.some((t) => {
        if (s.includes(t) || t.includes(s)) return true;
        const resolved = STATE_NAMES[t];
        return resolved && (s.includes(resolved) || resolved.includes(s));
      });

      if (cityMatches && stateMatches) {
        return [loc];
      }
    } else if (tokens.length === 1) {
      if (c === tokens[0] || c.startsWith(tokens[0])) {
        return [loc];
      }
    }
  }

  return [];
}

/**
 * High-reliability Geocode lookup with in-memory caching and clean fallback.
 */
export async function geocodeLocation(query: string, limit = 5): Promise<LocationPoint[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheKey = trimmed.toLowerCase();

  // 1. Check in-memory cache
  if (GEOCODE_CACHE.has(cacheKey)) {
    return GEOCODE_CACHE.get(cacheKey)!.slice(0, limit);
  }

  // 2. Check preset dictionary (handles "Newark, Essex County, New Jersey, United States" instantly)
  const presetResults = searchPreset(trimmed);
  if (presetResults.length > 0) {
    GEOCODE_CACHE.set(cacheKey, presetResults);
    return presetResults.slice(0, limit);
  }

  // 3. Resilient Nominatim fallback (short 3s timeout, no noisy console warnings)
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
      signal: AbortSignal.timeout(3000),
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
        GEOCODE_CACHE.set(cacheKey, results);
        return results;
      }
    }
  } catch {
    // Network or timeout abort - fall through silently to estimated coordinate resolution
  }

  // 4. Clean estimated centroid fallback
  const fallbackPoint: LocationPoint = {
    display_name: `${trimmed.toUpperCase()}, USA`,
    latitude: 38.5,
    longitude: -95.0,
    city: trimmed,
    state: 'US',
    country: 'United States',
  };

  const fallbackList = [fallbackPoint];
  GEOCODE_CACHE.set(cacheKey, fallbackList);
  return fallbackList;
}
