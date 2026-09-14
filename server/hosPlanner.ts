/**
 * RouteLedger - Commercial Driver Hours-of-Service (HOS) Engine (TypeScript)
 * Implements FMCSA 49 CFR Part 395 deterministic event-based simulation.
 */
import {
  LocationPoint,
  ScheduleEvent,
  StopMarker,
  DayPlan,
  TripPlan,
  PlanningSettings,
  RouteStep,
  DayRemark,
} from '../src/types.ts';
import { validateHOSPlan } from './hosValidator.ts';
import { generateELDLogs } from './logGenerator.ts';

export const DEFAULT_PLANNING_SETTINGS: PlanningSettings = {
  departure_time: '06:00',
  pickup_duration_hours: 1.0,
  dropoff_duration_hours: 1.0,
  fuel_interval_miles: 1000.0,
  fuel_duration_hours: 0.5,
  break_duration_hours: 0.5,
  daily_driving_limit_hours: 11.0,
  daily_duty_window_hours: 14.0,
  cycle_limit_hours: 70.0,
  qualifying_rest_hours: 10.0,
  restart_duration_hours: 34.0,
  allow_sleeper_berth: false,
};

function interpolateCoordinates(
  coords: [number, number][],
  fraction: number
): [number, number] {
  if (!coords || coords.length === 0) return [37.5407, -77.436];
  if (fraction <= 0 || coords.length === 1) return [coords[0][1], coords[0][0]]; // [lat, lng]
  if (fraction >= 1.0) return [coords[coords.length - 1][1], coords[coords.length - 1][0]];

  const idx = fraction * (coords.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, coords.length - 1);
  const remainder = idx - i0;

  const p0 = coords[i0];
  const p1 = coords[i1];
  // GeoJSON is [lng, lat]
  const lat = p0[1] + (p1[1] - p0[1]) * remainder;
  const lng = p0[0] + (p1[0] - p0[0]) * remainder;
  return [parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))];
}

export function planHOSSchedule(
  origin: LocationPoint,
  pickup: LocationPoint,
  destination: LocationPoint,
  totalDistanceMiles: number,
  totalDriveDurationHours: number,
  initialCycleUsed: number,
  departureDate: Date,
  routeGeometry: [number, number][],
  routeSteps: RouteStep[],
  customSettings?: Partial<PlanningSettings>,
  carrierInfo?: any
): TripPlan {
  const cfg = { ...DEFAULT_PLANNING_SETTINGS, ...(customSettings || {}) };

  const events: ScheduleEvent[] = [];
  const stops: StopMarker[] = [];
  const warnings: string[] = [];
  const violations: string[] = [];

  let currentTime = new Date(departureDate);
  let dutyWindowStart: Date | null = null;
  let drivingInCurrentWindow = 0.0;
  let hoursSinceLastBreak = 0.0;
  let cycleHoursUsed = Math.min(70.0, Math.max(0.0, initialCycleUsed));
  let milesSinceFuel = 0.0;
  let totalMilesDriven = 0.0;

  const effectiveDuration = Math.max(totalDriveDurationHours, 0.1);
  let averageSpeedMph = totalDistanceMiles / effectiveDuration;
  if (averageSpeedMph < 25) averageSpeedMph = 52;
  if (averageSpeedMph > 70) averageSpeedMph = 62;

  function addEvent(
    type: ScheduleEvent['type'],
    durationHours: number,
    dutyStatus: ScheduleEvent['duty_status'],
    description: string,
    locationName: string,
    lat: number,
    lng: number,
    milesCovered = 0.0
  ): ScheduleEvent {
    const start = new Date(currentTime);
    const end = new Date(currentTime.getTime() + durationHours * 3600 * 1000);
    const evt: ScheduleEvent = {
      id: `evt-${events.length + 1}`,
      type,
      duty_status: dutyStatus,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration_hours: parseFloat(durationHours.toFixed(3)),
      location_name: locationName,
      latitude: lat,
      longitude: lng,
      description,
      miles_covered: parseFloat(milesCovered.toFixed(2)),
      cumulative_miles: parseFloat(totalMilesDriven.toFixed(2)),
      cycle_hours_used_after: parseFloat(cycleHoursUsed.toFixed(2)),
    };
    events.push(evt);
    currentTime = end;
    return evt;
  }

  const origLat = origin.latitude;
  const origLng = origin.longitude;
  const origName = origin.display_name;

  const pickLat = pickup.latitude || origLat;
  const pickLng = pickup.longitude || origLng;
  const pickName = pickup.display_name || origName;

  // Step 1: Pre-trip cycle check (If cycle cannot accommodate pickup, take 34-hr restart first)
  if (cycleHoursUsed + cfg.pickup_duration_hours > cfg.cycle_limit_hours) {
    const restartHours = cfg.restart_duration_hours;
    const restartEv = addEvent(
      'RESTART_34_HR',
      restartHours,
      'OFF_DUTY',
      '34-Hour Qualifying Restart (Required prior to dispatch due to exhausted rolling cycle)',
      origName,
      origLat,
      origLng
    );
    stops.push({
      stop_type: 'RESTART_34_HR',
      name: `${origName} Terminal`,
      latitude: origLat,
      longitude: origLng,
      arrival_time: restartEv.start_time,
      departure_time: restartEv.end_time,
      duration_minutes: restartHours * 60,
      duty_status: 'OFF_DUTY',
      reason: '34-hour restart to reset rolling 70-hour cycle prior to dispatch',
    });
    cycleHoursUsed = 0.0;
  }

  // Step 2: Pickup Event (1.0 hr on-duty not driving)
  dutyWindowStart = currentTime;
  cycleHoursUsed += cfg.pickup_duration_hours;

  const pickupEv = addEvent(
    'PICKUP',
    cfg.pickup_duration_hours,
    'ON_DUTY_NOT_DRIVING',
    'Cargo pickup & freight securement inspection',
    pickName,
    pickLat,
    pickLng
  );

  stops.push({
    stop_type: 'PICKUP',
    name: pickName,
    latitude: pickLat,
    longitude: pickLng,
    arrival_time: pickupEv.start_time,
    departure_time: pickupEv.end_time,
    duration_minutes: Math.round(cfg.pickup_duration_hours * 60),
    duty_status: 'ON_DUTY_NOT_DRIVING',
    reason: 'Freight loading, securement, and documentation (1.0 hr)',
  });

  // Step 3: Driving Simulation Loop
  let remainingRouteMiles = totalDistanceMiles;
  let safetyLoop = 0;
  const maxIterations = 200;

  while (remainingRouteMiles > 0.01 && safetyLoop < maxIterations) {
    safetyLoop++;

    // A. Check rolling cycle limit
    const remainingCycle = cfg.cycle_limit_hours - cycleHoursUsed;
    if (remainingCycle < 0.25) {
      // Trigger 34-hour restart
      const restartHours = cfg.restart_duration_hours;
      const [currLat, currLng] = interpolateCoordinates(
        routeGeometry,
        totalMilesDriven / Math.max(totalDistanceMiles, 1)
      );
      const locName = `Mile ${Math.round(totalMilesDriven)} Safe Haven`;
      const restartEv = addEvent(
        'RESTART_34_HR',
        restartHours,
        'OFF_DUTY',
        '34-Hour Qualifying Restart (Resets 70-Hour / 8-Day Cycle)',
        locName,
        currLat,
        currLng
      );
      stops.push({
        stop_type: 'RESTART_34_HR',
        name: locName,
        latitude: currLat,
        longitude: currLng,
        arrival_time: restartEv.start_time,
        departure_time: restartEv.end_time,
        duration_minutes: restartHours * 60,
        duty_status: 'OFF_DUTY',
        reason: '34-hour restart to reset rolling 70-hour cycle',
      });
      cycleHoursUsed = 0.0;
      dutyWindowStart = null;
      drivingInCurrentWindow = 0.0;
      hoursSinceLastBreak = 0.0;
      continue;
    }

    // B. Check 14-hour duty window & 11-hour driving limit
    let windowLeft = cfg.daily_duty_window_hours;
    let driveLeftInWindow = cfg.daily_driving_limit_hours - drivingInCurrentWindow;

    if (dutyWindowStart !== null) {
      const elapsed = (currentTime.getTime() - dutyWindowStart.getTime()) / (3600 * 1000);
      windowLeft = cfg.daily_duty_window_hours - elapsed;
    }

    if (windowLeft <= 0.05 || driveLeftInWindow <= 0.05) {
      // Mandatory 10-hour rest
      const restHours = cfg.qualifying_rest_hours;
      const restStatus = cfg.allow_sleeper_berth ? 'SLEEPER_BERTH' : 'OFF_DUTY';
      const [currLat, currLng] = interpolateCoordinates(
        routeGeometry,
        totalMilesDriven / Math.max(totalDistanceMiles, 1)
      );
      const locName = `Mile ${Math.round(totalMilesDriven)} Rest Area`;
      const restEv = addEvent(
        'REST_10_HR',
        restHours,
        restStatus,
        '10-Hour Mandatory Off-Duty / Sleeper Rest Period',
        locName,
        currLat,
        currLng
      );
      stops.push({
        stop_type: 'REST_10_HR',
        name: locName,
        latitude: currLat,
        longitude: currLng,
        arrival_time: restEv.start_time,
        departure_time: restEv.end_time,
        duration_minutes: restHours * 60,
        duty_status: restStatus,
        reason: '10-hour qualifying rest (resets 11-hour drive & 14-hour window)',
      });
      dutyWindowStart = null;
      drivingInCurrentWindow = 0.0;
      hoursSinceLastBreak = 0.0;
      continue;
    }

    // C. Check 30-minute break requirement (after 8 hours cumulative driving)
    const breakLeft = 8.0 - hoursSinceLastBreak;
    if (breakLeft <= 0.05) {
      const [currLat, currLng] = interpolateCoordinates(
        routeGeometry,
        totalMilesDriven / Math.max(totalDistanceMiles, 1)
      );
      const locName = `Mile ${Math.round(totalMilesDriven)} Travel Plaza`;
      const breakEv = addEvent(
        'REST_30_MIN',
        cfg.break_duration_hours,
        'OFF_DUTY',
        'Mandatory 30-Minute Rest Break (8-Hour Cumulative Drive Rule)',
        locName,
        currLat,
        currLng
      );
      stops.push({
        stop_type: 'REST_30_MIN',
        name: locName,
        latitude: currLat,
        longitude: currLng,
        arrival_time: breakEv.start_time,
        departure_time: breakEv.end_time,
        duration_minutes: Math.round(cfg.break_duration_hours * 60),
        duty_status: 'OFF_DUTY',
        reason: '30-minute off-duty break required after 8 hrs cumulative driving',
      });
      hoursSinceLastBreak = 0.0;
      continue;
    }

    // D. Check fuel stop interval (every 1000 miles)
    const milesUntilFuel = cfg.fuel_interval_miles - milesSinceFuel;
    if (milesUntilFuel <= 1.0) {
      const [currLat, currLng] = interpolateCoordinates(
        routeGeometry,
        totalMilesDriven / Math.max(totalDistanceMiles, 1)
      );
      const locName = `Mile ${Math.round(totalMilesDriven)} Fuel Stop`;
      cycleHoursUsed += cfg.fuel_duration_hours;
      const fuelEv = addEvent(
        'FUEL',
        cfg.fuel_duration_hours,
        'ON_DUTY_NOT_DRIVING',
        'Commercial Fueling & Equipment Walk-Around',
        locName,
        currLat,
        currLng
      );
      stops.push({
        stop_type: 'FUEL',
        name: locName,
        latitude: currLat,
        longitude: currLng,
        arrival_time: fuelEv.start_time,
        departure_time: fuelEv.end_time,
        duration_minutes: Math.round(cfg.fuel_duration_hours * 60),
        duty_status: 'ON_DUTY_NOT_DRIVING',
        reason: 'Commercial fueling (< 1,000 mile mandatory interval)',
      });
      milesSinceFuel = 0.0;
      continue;
    }

    // E. Start duty window if starting fresh shift
    if (dutyWindowStart === null) {
      dutyWindowStart = currentTime;
    }

    // Calculate smallest legal limit
    const elapsed = (currentTime.getTime() - dutyWindowStart.getTime()) / (3600 * 1000);
    const legalWindowDrive = Math.max(0, cfg.daily_duty_window_hours - elapsed);
    const legal11hrDrive = Math.max(0, cfg.daily_driving_limit_hours - drivingInCurrentWindow);
    const legalBreakDrive = Math.max(0, 8.0 - hoursSinceLastBreak);
    const legalCycleDrive = Math.max(0, cfg.cycle_limit_hours - cycleHoursUsed);
    const legalFuelDrive = milesUntilFuel / averageSpeedMph;
    const neededTripDrive = remainingRouteMiles / averageSpeedMph;

    const driveHours = Math.min(
      neededTripDrive,
      legalWindowDrive,
      legal11hrDrive,
      legalBreakDrive,
      legalCycleDrive,
      legalFuelDrive
    );

    if (driveHours <= 0.02) {
      // Must take rest or break; handled in next iteration
      continue;
    }

    const distanceChunk = Math.min(remainingRouteMiles, driveHours * averageSpeedMph);
    const startMiles = totalMilesDriven;
    totalMilesDriven += distanceChunk;
    remainingRouteMiles -= distanceChunk;

    drivingInCurrentWindow += driveHours;
    hoursSinceLastBreak += driveHours;
    cycleHoursUsed += driveHours;
    milesSinceFuel += distanceChunk;

    const [currLat, currLng] = interpolateCoordinates(
      routeGeometry,
      totalMilesDriven / Math.max(totalDistanceMiles, 1)
    );
    const segDesc = `Transit mile ${Math.round(startMiles)} to ${Math.round(totalMilesDriven)} (${distanceChunk.toFixed(1)} mi @ ${Math.round(averageSpeedMph)} mph)`;

    addEvent(
      'DRIVING',
      driveHours,
      'DRIVING',
      segDesc,
      `In Transit (Mile ${Math.round(totalMilesDriven)})`,
      currLat,
      currLng,
      distanceChunk
    );
  }

  // Step 4: Dropoff Event (1.0 hr on-duty not driving)
  const destLat = destination.latitude || pickLat;
  const destLng = destination.longitude || pickLng;
  const destName = destination.display_name || 'Destination';

  cycleHoursUsed += cfg.dropoff_duration_hours;
  const dropoffEv = addEvent(
    'DROPOFF',
    cfg.dropoff_duration_hours,
    'ON_DUTY_NOT_DRIVING',
    'Cargo unloading, receiver check-in, and delivery sign-off',
    destName,
    destLat,
    destLng
  );

  stops.push({
    stop_type: 'DROPOFF',
    name: destName,
    latitude: destLat,
    longitude: destLng,
    arrival_time: dropoffEv.start_time,
    departure_time: dropoffEv.end_time,
    duration_minutes: Math.round(cfg.dropoff_duration_hours * 60),
    duty_status: 'ON_DUTY_NOT_DRIVING',
    reason: 'Final freight unloading and delivery sign-off (1.0 hr)',
  });

  const tripStart = departureDate;
  const tripEnd = currentTime;
  const totalTripDurationHours = (tripEnd.getTime() - tripStart.getTime()) / (3600 * 1000);

  // Daily ELD breakdown slicing across calendar midnights
  const days = buildDailyBreakdown(events, tripStart, tripEnd);

  // Stop counts
  const breakCount = stops.filter((s) => s.stop_type === 'REST_30_MIN').length;
  const fuelCount = stops.filter((s) => s.stop_type === 'FUEL').length;
  const rest10Count = stops.filter((s) => s.stop_type === 'REST_10_HR').length;
  const restartCount = stops.filter((s) => s.stop_type === 'RESTART_34_HR').length;

  const totalDriveHours = events
    .filter((e) => e.duty_status === 'DRIVING')
    .reduce((sum, e) => sum + e.duration_hours, 0);

  const initialPlan: TripPlan = {
    id: `plan-${Date.now().toString(36)}`,
    origin,
    pickup,
    destination,
    total_distance_miles: parseFloat(totalDistanceMiles.toFixed(2)),
    total_drive_hours: parseFloat(totalDriveHours.toFixed(2)),
    estimated_total_duration_hours: parseFloat(totalTripDurationHours.toFixed(2)),
    start_time: tripStart.toISOString(),
    end_time: tripEnd.toISOString(),
    initial_cycle_used: parseFloat(initialCycleUsed.toFixed(2)),
    final_cycle_used: parseFloat(cycleHoursUsed.toFixed(2)),
    cycle_remaining_hours: Math.max(0, parseFloat((cfg.cycle_limit_hours - cycleHoursUsed).toFixed(2))),
    days_count: days.length,
    counts: {
      rest_30_min: breakCount,
      fuel_stops: fuelCount,
      rest_10_hr: rest10Count,
      restarts_34_hr: restartCount,
    },
    events,
    stops,
    days,
    daily_logs: [],
    route_geometry: routeGeometry,
    route_steps: routeSteps,
    warnings,
    violations,
    is_compliant: true,
    compliance_status: 'COMPLIANT',
    validation: {
      compliant: true,
      violations: [],
      warnings: [],
      metrics: {
        max_shift_driving_hours: 0,
        max_duty_window_hours: 0,
        max_continuous_driving_before_break: 0,
        peak_cycle_hours: cycleHoursUsed,
        max_distance_between_fuel_miles: 0,
        total_miles_audited: totalDistanceMiles,
        total_days_audited: days.length,
      },
    },
    created_at: new Date().toISOString(),
  };

  // Run Independent HOS Validator
  const validationResult = validateHOSPlan(initialPlan);
  initialPlan.validation = validationResult;
  initialPlan.is_compliant = validationResult.compliant;
  initialPlan.compliance_status = validationResult.compliant ? 'COMPLIANT' : 'VIOLATION';
  if (!validationResult.compliant) {
    initialPlan.violations = validationResult.violations;
  }

  // Generate FMCSA ELD Daily Log Sheets
  initialPlan.daily_logs = generateELDLogs(days, carrierInfo);

  return initialPlan;
}

function buildDailyBreakdown(
  events: ScheduleEvent[],
  tripStart: Date,
  tripEnd: Date
): DayPlan[] {
  if (events.length === 0) return [];

  const startDate = new Date(tripStart.getFullYear(), tripStart.getMonth(), tripStart.getDate(), 0, 0, 0);
  const endDate = new Date(tripEnd.getFullYear(), tripEnd.getMonth(), tripEnd.getDate(), 0, 0, 0);

  const days: DayPlan[] = [];
  let cur = new Date(startDate);

  while (cur <= endDate) {
    const dayStart = new Date(cur);
    const dayEnd = new Date(cur.getTime() + 24 * 3600 * 1000);

    const dayEvents: ScheduleEvent[] = [];

    // Pre-trip buffer on day 1 if departure is e.g. 06:00
    if (tripStart > dayStart && cur.getTime() === startDate.getTime()) {
      const preTripHours = (tripStart.getTime() - dayStart.getTime()) / (3600 * 1000);
      if (preTripHours > 0) {
        dayEvents.push({
          id: `day-${days.length + 1}-pre`,
          type: 'OFF_DUTY_BUFFER',
          duty_status: 'OFF_DUTY',
          start_time: dayStart.toISOString(),
          end_time: tripStart.toISOString(),
          duration_hours: parseFloat(preTripHours.toFixed(4)),
          location_name: events[0]?.location_name || 'Terminal',
          description: 'Off Duty Prior to Scheduled Dispatch',
          miles_covered: 0,
        });
      }
    }

    for (const e of events) {
      const eStart = new Date(e.start_time);
      const eEnd = new Date(e.end_time);

      const overlapStart = new Date(Math.max(dayStart.getTime(), eStart.getTime()));
      const overlapEnd = new Date(Math.min(dayEnd.getTime(), eEnd.getTime()));

      if (overlapEnd > overlapStart) {
        const durHours = (overlapEnd.getTime() - overlapStart.getTime()) / (3600 * 1000);
        const fraction = durHours / Math.max(e.duration_hours, 0.0001);
        const slicedMiles = (e.miles_covered || 0) * Math.min(1.0, fraction);

        dayEvents.push({
          id: `${e.id}-${cur.toISOString().slice(0, 10)}`,
          type: e.type,
          duty_status: e.duty_status,
          start_time: overlapStart.toISOString(),
          end_time: overlapEnd.toISOString(),
          duration_hours: parseFloat(durHours.toFixed(4)),
          location_name: e.location_name,
          latitude: e.latitude,
          longitude: e.longitude,
          description: e.description,
          miles_covered: parseFloat(slicedMiles.toFixed(2)),
        });
      }
    }

    // Post-trip buffer on last day if dropoff ends before midnight
    if (tripEnd < dayEnd && cur.getTime() === endDate.getTime()) {
      const postTripHours = (dayEnd.getTime() - tripEnd.getTime()) / (3600 * 1000);
      if (postTripHours > 0) {
        dayEvents.push({
          id: `day-${days.length + 1}-post`,
          type: 'OFF_DUTY_BUFFER',
          duty_status: 'OFF_DUTY',
          start_time: tripEnd.toISOString(),
          end_time: dayEnd.toISOString(),
          duration_hours: parseFloat(postTripHours.toFixed(4)),
          location_name: events[events.length - 1]?.location_name || 'Receiver',
          description: 'Off Duty Following Delivery & Check-Out',
          miles_covered: 0,
        });
      }
    }

    const offDuty = dayEvents
      .filter((e) => e.duty_status === 'OFF_DUTY')
      .reduce((s, e) => s + e.duration_hours, 0);
    const sleeper = dayEvents
      .filter((e) => e.duty_status === 'SLEEPER_BERTH')
      .reduce((s, e) => s + e.duration_hours, 0);
    const driving = dayEvents
      .filter((e) => e.duty_status === 'DRIVING')
      .reduce((s, e) => s + e.duration_hours, 0);
    const onDutyNotDrive = dayEvents
      .filter((e) => e.duty_status === 'ON_DUTY_NOT_DRIVING')
      .reduce((s, e) => s + e.duration_hours, 0);
    const dailyMiles = dayEvents.reduce((s, e) => s + (e.miles_covered || 0), 0);

    const remarks: DayRemark[] = dayEvents.map((e) => {
      const d = new Date(e.start_time);
      const timeStr = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      return {
        time: timeStr,
        location: e.location_name,
        status: e.duty_status,
        description: e.description,
      };
    });

    days.push({
      day_number: days.length + 1,
      date: cur.toISOString().slice(0, 10),
      total_hours: parseFloat((offDuty + sleeper + driving + onDutyNotDrive).toFixed(2)),
      off_duty_hours: parseFloat(offDuty.toFixed(2)),
      sleeper_berth_hours: parseFloat(sleeper.toFixed(2)),
      driving_hours: parseFloat(driving.toFixed(2)),
      on_duty_not_driving_hours: parseFloat(onDutyNotDrive.toFixed(2)),
      total_on_duty_hours: parseFloat((driving + onDutyNotDrive).toFixed(2)),
      total_miles_driving_today: parseFloat(dailyMiles.toFixed(2)),
      events: dayEvents,
      remarks,
    });

    cur = new Date(cur.getTime() + 24 * 3600 * 1000);
  }

  return days;
}
