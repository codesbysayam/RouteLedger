/**
 * RouteLedger - Frontend API Client
 * Supports backend endpoints with automatic client-side fallback for static deployments (e.g. Vercel)
 */
import {
  TripPlan,
  LocationPoint,
  PlanningSettings,
  CarrierInfo,
  ApiResponse,
} from '../types.ts';
import { geocodeLocation } from '../../server/geocodingService.ts';
import { planTripClientSide } from './localPlanner.ts';

async function safeParseJson<T>(res: Response): Promise<ApiResponse<T> | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

export async function searchLocations(query: string, limit = 5): Promise<LocationPoint[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });

    if (res.ok) {
      const json = await safeParseJson<LocationPoint[]>(res);
      if (json?.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // API endpoint unreachable, fall back to client-side geocoder
  }

  try {
    return await geocodeLocation(query, limit);
  } catch (err) {
    console.error('Failed to search locations client-side:', err);
    return [];
  }
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
  try {
    const res = await fetch('/api/trips/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await safeParseJson<TripPlan>(res);
      if (json?.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Backend API is offline or not hosted (e.g. Vercel static deployment)
  }

  // Seamless client-side planning fallback
  return await planTripClientSide(payload);
}

export async function getTripById(id: string): Promise<TripPlan> {
  try {
    const res = await fetch(`/api/trips/${id}`);
    if (res.ok) {
      const json = await safeParseJson<TripPlan>(res);
      if (json?.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }
  throw new Error('Trip not found or service unavailable.');
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const json = await safeParseJson<{ status: string }>(res);
    return json?.success === true;
  } catch {
    return false;
  }
}

