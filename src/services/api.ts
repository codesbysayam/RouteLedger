/**
 * RouteLedger - Frontend API Client
 */
import {
  TripPlan,
  LocationPoint,
  PlanningSettings,
  CarrierInfo,
  ApiResponse,
} from '../types.ts';

export async function searchLocations(query: string, limit = 5): Promise<LocationPoint[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });
    const json = (await res.json()) as ApiResponse<LocationPoint[]>;
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.error('Failed to search locations:', err);
  }
  return [];
}

export interface PlanTripPayload {
  origin: string | LocationPoint;
  pickup?: string | LocationPoint;
  destination: string | LocationPoint;
  current_cycle_used: number;
  departure_time?: string;
  carrier_info?: Partial<CarrierInfo>;
  settings?: Partial<PlanningSettings>;
}

export async function planTrip(payload: PlanTripPayload): Promise<TripPlan> {
  const res = await fetch('/api/trips/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as ApiResponse<TripPlan>;
  if (!json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to plan trip.');
  }
  return json.data;
}

export async function getTripById(id: string): Promise<TripPlan> {
  const res = await fetch(`/api/trips/${id}`);
  const json = (await res.json()) as ApiResponse<TripPlan>;
  if (!json.success || !json.data) {
    throw new Error(json.error?.message || 'Trip not found.');
  }
  return json.data;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    const json = await res.json();
    return json?.success === true;
  } catch {
    return false;
  }
}
