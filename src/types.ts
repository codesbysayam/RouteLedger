/**
 * RouteLedger - Global TypeScript Interfaces & Types
 */

export const DutyStatus = {
  OFF_DUTY: 'OFF_DUTY',
  SLEEPER_BERTH: 'SLEEPER_BERTH',
  DRIVING: 'DRIVING',
  ON_DUTY_NOT_DRIVING: 'ON_DUTY_NOT_DRIVING',
} as const;

export type DutyStatus = (typeof DutyStatus)[keyof typeof DutyStatus];

export type EventType =
  | 'PICKUP'
  | 'DRIVING'
  | 'REST_30_MIN'
  | 'FUEL'
  | 'REST_10_HR'
  | 'RESTART_34_HR'
  | 'DROPOFF'
  | 'OFF_DUTY_BUFFER';

export interface LocationPoint {
  display_name: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface ScheduleEvent {
  id: string;
  type: EventType;
  duty_status: DutyStatus | string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  location_name: string;
  latitude?: number;
  longitude?: number;
  description: string;
  miles_covered?: number;
  cumulative_miles?: number;
  cycle_hours_used_after?: number;
}

export type TripEvent = ScheduleEvent;

export interface StopMarker {
  stop_type: string;
  name: string;
  latitude: number;
  longitude: number;
  arrival_time: string;
  departure_time: string;
  duration_minutes: number;
  duty_status: DutyStatus | string;
  reason: string;
}

export interface DayRemark {
  time: string;
  location: string;
  status: DutyStatus | string;
  description: string;
}

export interface DayPlan {
  day_number: number;
  date: string;
  total_hours: number;
  off_duty_hours: number;
  sleeper_berth_hours: number;
  driving_hours: number;
  on_duty_not_driving_hours: number;
  total_on_duty_hours: number;
  total_miles_driving_today: number;
  events: ScheduleEvent[];
  remarks: DayRemark[];
}

export interface ELDGraphSegment {
  event_id?: string;
  duty_status: DutyStatus | string;
  start_time: string;
  end_time: string;
  start_fraction: number;
  end_fraction: number;
  duration_hours: number;
  location_name: string;
  description: string;
}

export interface ELDDailyLogSheet {
  day_number: number;
  date: string;
  carrier_name: string;
  main_office_address: string;
  home_terminal_address: string;
  driver_name: string;
  co_driver: string;
  truck_tractor_number: string;
  trailer_number: string;
  shipping_documents: string;
  total_miles_driving_today: number;
  total_hours: number;
  totals: {
    off_duty_hours: number;
    sleeper_berth_hours: number;
    driving_hours: number;
    on_duty_not_driving_hours: number;
    total_on_duty_hours: number;
  };
  graph_segments: ELDGraphSegment[];
  remarks: DayRemark[];
  certified: boolean;
  certification_statement: string;
}

export interface RouteStep {
  instruction: string;
  distance_miles: number;
  duration_minutes: number;
  name?: string;
  type?: string;
  modifier?: string;
  location?: [number, number];
}

export interface HOSValidationMetrics {
  max_shift_driving_hours: number;
  max_duty_window_hours: number;
  max_continuous_driving_before_break: number;
  peak_cycle_hours: number;
  max_distance_between_fuel_miles: number;
  total_miles_audited: number;
  total_days_audited: number;
}

export interface HOSValidationResult {
  compliant: boolean;
  violations: string[];
  warnings: string[];
  metrics: HOSValidationMetrics;
}

export interface CarrierInfo {
  carrier_name: string;
  main_office: string;
  home_terminal: string;
  driver_name: string;
  vehicle_number: string;
  trailer_number: string;
  shipping_doc: string;
  co_driver?: string;
}

export interface PlanningSettings {
  departure_time: string;
  pickup_duration_hours: number;
  dropoff_duration_hours: number;
  fuel_interval_miles: number;
  fuel_duration_hours: number;
  break_duration_hours: number;
  daily_driving_limit_hours: number;
  daily_duty_window_hours: number;
  cycle_limit_hours: number;
  qualifying_rest_hours: number;
  restart_duration_hours: number;
  allow_sleeper_berth: boolean;
}

export interface TripPlan {
  id: string;
  origin: LocationPoint;
  pickup: LocationPoint;
  destination: LocationPoint;
  total_distance_miles: number;
  total_drive_hours: number;
  estimated_total_duration_hours: number;
  start_time: string;
  end_time: string;
  initial_cycle_used: number;
  final_cycle_used: number;
  cycle_remaining_hours: number;
  days_count: number;
  counts: {
    rest_30_min: number;
    fuel_stops: number;
    rest_10_hr: number;
    restarts_34_hr: number;
  };
  events: ScheduleEvent[];
  stops: StopMarker[];
  days: DayPlan[];
  daily_logs: ELDDailyLogSheet[];
  route_geometry: [number, number][]; // [longitude, latitude]
  route_steps: RouteStep[];
  warnings: string[];
  violations: string[];
  is_compliant: boolean;
  compliance_status: 'COMPLIANT' | 'ATTENTION_REQUIRED' | 'VIOLATION';
  validation: HOSValidationResult;
  carrier_info?: CarrierInfo;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}
