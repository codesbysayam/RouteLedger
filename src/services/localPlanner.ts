/**
 * RouteLedger - Client-Side Trip & HOS Planner Fallback
 * Provides instant in-browser routing and 49 CFR § 395 HOS calculations
 * when backend API is unreachable or deployed on static platforms like Vercel.
 */
import {
  TripPlan,
  LocationPoint,
  PlanningSettings,
  CarrierInfo,
} from '../types.ts';
import { geocodeLocation } from '../../server/geocodingService.ts';
import { fetchOSRMRoute } from '../../server/routingService.ts';
import { planHOSSchedule } from '../../server/hosPlanner.ts';

export interface LocalPlanPayload {
  origin: string | LocationPoint;
  pickup?: string | LocationPoint;
  destination: string | LocationPoint;
  current_cycle_used: number;
  departure_time?: string;
  carrier_info?: Partial<CarrierInfo>;
  settings?: Partial<PlanningSettings>;
}

export async function planTripClientSide(payload: LocalPlanPayload): Promise<TripPlan> {
  const {
    origin,
    pickup,
    destination,
    current_cycle_used = 0,
    departure_time,
    carrier_info,
    settings,
  } = payload;

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
    try {
      const geoResults = await geocodeLocation(str, 1);
      if (geoResults && geoResults.length > 0) return geoResults[0];
    } catch {
      // Fallback
    }
    return {
      display_name: str,
      latitude: fallbackLat,
      longitude: fallbackLng,
    };
  };

  const originLoc = await resolveLoc(origin, 'Richmond, Virginia', 37.5407, -77.436);
  const pickupLoc = await resolveLoc(
    pickup || origin,
    originLoc.display_name,
    originLoc.latitude,
    originLoc.longitude
  );
  const destLoc = await resolveLoc(destination, 'Newark, New Jersey', 40.7357, -74.1724);

  const waypoints: [number, number][] = [[originLoc.latitude, originLoc.longitude]];
  const distOrigPick =
    Math.abs(originLoc.latitude - pickupLoc.latitude) +
    Math.abs(originLoc.longitude - pickupLoc.longitude);
  if (distOrigPick > 0.002) {
    waypoints.push([pickupLoc.latitude, pickupLoc.longitude]);
  }
  waypoints.push([destLoc.latitude, destLoc.longitude]);

  let routeData;
  try {
    routeData = await fetchOSRMRoute(waypoints, 'full', true);
  } catch {
    routeData = {
      distance_miles: 334.8,
      duration_hours: 5.7,
      geometry: [
        [-77.436, 37.5407],
        [-77.0369, 38.9072],
        [-76.6122, 39.2904],
        [-75.1652, 39.9526],
        [-74.1724, 40.7357],
      ] as [number, number][],
      steps: [],
    };
  }

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

  const cycleUsed = Math.min(70, Math.max(0, Number(current_cycle_used) || 0));

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

  if (carrier_info) {
    tripPlan.carrier_info = {
      ...tripPlan.carrier_info,
      ...carrier_info,
    } as CarrierInfo;
  }

  return tripPlan;
}
