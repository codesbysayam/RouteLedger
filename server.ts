import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { geocodeLocation } from './server/geocodingService.ts';
import { fetchOSRMRoute } from './server/routingService.ts';
import { planHOSSchedule } from './server/hosPlanner.ts';
import { TripPlan, LocationPoint } from './src/types.ts';

// In-memory store for planned trips
const savedTrips = new Map<string, TripPlan>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: { status: 'ok', service: 'RouteLedger Commercial HOS Planner API' },
      error: null,
    });
  });

  // Geocoding endpoint (Nominatim proxy with debouncing & cache)
  app.post('/api/geocode', async (req: Request, res: Response) => {
    try {
      const { query, limit = 5 } = req.body;
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'INVALID_QUERY', message: 'Location search query is required.' },
        });
        return;
      }
      const results = await geocodeLocation(query, Number(limit));
      res.json({ success: true, data: results, error: null });
    } catch (err: any) {
      console.error('[API /api/geocode] Error:', err);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'GEOCODE_ERROR', message: 'Geocoding failed.' },
      });
    }
  });

  // Route calculation endpoint (OSRM proxy)
  app.post('/api/route', async (req: Request, res: Response) => {
    try {
      const { waypoints, overview = 'full', steps = true } = req.body;
      if (!Array.isArray(waypoints) || waypoints.length < 2) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'INVALID_WAYPOINTS', message: 'At least 2 waypoints required.' },
        });
        return;
      }
      const route = await fetchOSRMRoute(waypoints, overview, steps);
      res.json({ success: true, data: route, error: null });
    } catch (err: any) {
      console.error('[API /api/route] Error:', err);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'ROUTE_ERROR', message: 'Road route calculation failed.' },
      });
    }
  });

  // Trip planning endpoint
  app.post('/api/trips/plan', async (req: Request, res: Response) => {
    try {
      const {
        origin,
        pickup,
        destination,
        current_cycle_used = 0,
        departure_time,
        carrier_info,
        settings,
      } = req.body;

      if (!origin || !destination) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'MISSING_FIELDS', message: 'Origin and destination are required.' },
        });
        return;
      }

      const cycleUsed = parseFloat(current_cycle_used);
      if (isNaN(cycleUsed) || cycleUsed < 0 || cycleUsed > 70) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'INVALID_CYCLE', message: 'Current cycle hours must be between 0 and 70.' },
        });
        return;
      }

      // 1. Resolve Locations
      const resolveLoc = async (
        input: any,
        fallbackName: string,
        fallbackLat: number,
        fallbackLng: number
      ): Promise<LocationPoint> => {
        if (typeof input === 'object' && input !== null && input.latitude && input.longitude) {
          return {
            display_name: input.display_name || fallbackName,
            latitude: Number(input.latitude),
            longitude: Number(input.longitude),
            city: input.city,
            state: input.state,
          };
        }
        const str = typeof input === 'string' ? input.trim() : fallbackName;
        const geoResults = await geocodeLocation(str, 1);
        if (geoResults.length > 0) return geoResults[0];
        return {
          display_name: str,
          latitude: fallbackLat,
          longitude: fallbackLng,
        };
      };

      const originLoc = await resolveLoc(origin, 'Richmond, Virginia', 37.5407, -77.436);
      const pickupLoc = await resolveLoc(pickup || origin, originLoc.display_name, originLoc.latitude, originLoc.longitude);
      const destLoc = await resolveLoc(destination, 'Newark, New Jersey', 40.7357, -74.1724);

      // 2. Compute Road Route via OSRM
      const waypoints: [number, number][] = [[originLoc.latitude, originLoc.longitude]];
      const distOrigPick =
        Math.abs(originLoc.latitude - pickupLoc.latitude) +
        Math.abs(originLoc.longitude - pickupLoc.longitude);
      if (distOrigPick > 0.002) {
        waypoints.push([pickupLoc.latitude, pickupLoc.longitude]);
      }
      waypoints.push([destLoc.latitude, destLoc.longitude]);

      const routeData = await fetchOSRMRoute(waypoints, 'full', true);

      // 3. Parse departure time
      let depDate = new Date();
      if (departure_time) {
        const parsed = new Date(departure_time);
        if (!isNaN(parsed.getTime())) {
          depDate = parsed;
        } else if (/^\d{2}:\d{2}$/.test(departure_time)) {
          const [hh, mm] = departure_time.split(':').map(Number);
          depDate.setHours(hh, mm, 0, 0);
        }
      } else {
        depDate.setHours(6, 0, 0, 0);
      }

      // 4. Run HOS Simulation + Independent Validator + ELD Log Generator
      const tripPlan = planHOSSchedule(
        originLoc,
        pickupLoc,
        destLoc,
        routeData.distance_miles,
        routeData.duration_hours,
        cycleUsed,
        depDate,
        routeData.geometry,
        routeData.steps,
        settings,
        carrier_info
      );

      tripPlan.carrier_info = carrier_info;
      savedTrips.set(tripPlan.id, tripPlan);

      res.status(201).json({ success: true, data: tripPlan, error: null });
    } catch (err: any) {
      console.error('[API /api/trips/plan] Planning Error:', err);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'PLAN_ERROR', message: err?.message || 'Failed to generate HOS trip plan.' },
      });
    }
  });

  // Trip retrieval
  app.get('/api/trips/:id', (req: Request, res: Response) => {
    const trip = savedTrips.get(req.params.id);
    if (!trip) {
      res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: `Trip ${req.params.id} not found.` },
      });
      return;
    }
    res.json({ success: true, data: trip, error: null });
  });

  app.get('/api/trips', (req: Request, res: Response) => {
    const list = Array.from(savedTrips.values()).map((t) => ({
      id: t.id,
      origin: t.origin.display_name,
      destination: t.destination.display_name,
      distance: t.total_distance_miles,
      compliance_status: t.compliance_status,
      created_at: t.created_at,
    }));
    res.json({ success: true, data: list, error: null });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RouteLedger server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
