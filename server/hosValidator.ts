/**
 * RouteLedger - Independent HOS Plan Validator (TypeScript)
 * Independently audits schedule events without trusting planner state.
 */
import { TripPlan, HOSValidationResult, ScheduleEvent } from '../src/types.ts';

export function validateHOSPlan(plan: TripPlan): HOSValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  const events = plan.events || [];

  if (events.length === 0) {
    return {
      compliant: false,
      violations: ['Plan has no events.'],
      warnings: [],
      metrics: {
        max_shift_driving_hours: 0,
        max_duty_window_hours: 0,
        max_continuous_driving_before_break: 0,
        peak_cycle_hours: 0,
        max_distance_between_fuel_miles: 0,
        total_miles_audited: 0,
        total_days_audited: 0,
      },
    };
  }

  // 1. Overlapping and Chronological check
  for (let i = 0; i < events.length - 1; i++) {
    const eCurr = events[i];
    const eNext = events[i + 1];
    const endCurr = new Date(eCurr.end_time).getTime();
    const startNext = new Date(eNext.start_time).getTime();

    if (endCurr > startNext) {
      violations.push(
        `Overlapping events: ${eCurr.id} ends at ${eCurr.end_time} but ${eNext.id} starts at ${eNext.start_time}`
      );
    }
  }

  let currentShiftDrive = 0.0;
  let shiftDutyStart: Date | null = null;
  let hoursSinceQualifyingBreak = 0.0;
  let cycleHoursAcc = plan.initial_cycle_used;
  let milesSinceFuel = 0.0;
  let totalMilesAudited = 0.0;

  let pickupFound = false;
  let dropoffFound = false;

  let maxDrivingInSingleShift = 0.0;
  let maxWindowDurationSeen = 0.0;
  let maxDrivingBeforeBreak = 0.0;
  let maxCycleHoursReached = cycleHoursAcc;
  let maxMilesBetweenFuel = 0.0;

  for (const e of events) {
    const dur = e.duration_hours;
    const eStart = new Date(e.start_time);
    const eEnd = new Date(e.end_time);
    const milesCov = e.miles_covered || 0.0;

    if (e.type === 'PICKUP') {
      pickupFound = true;
      if (Math.abs(dur - 1.0) > 0.05) {
        violations.push(`Pickup duration must be exactly 1.0 hour, found ${dur}`);
      }
      if (e.duty_status !== 'ON_DUTY_NOT_DRIVING') {
        violations.push(`Pickup duty status must be ON_DUTY_NOT_DRIVING, found ${e.duty_status}`);
      }
    }

    if (e.type === 'DROPOFF') {
      dropoffFound = true;
      if (Math.abs(dur - 1.0) > 0.05) {
        violations.push(`Dropoff duration must be exactly 1.0 hour, found ${dur}`);
      }
      if (e.duty_status !== 'ON_DUTY_NOT_DRIVING') {
        violations.push(`Dropoff duty status must be ON_DUTY_NOT_DRIVING, found ${e.duty_status}`);
      }
    }

    // 34-hour restart reset
    if (e.type === 'RESTART_34_HR' || ((e.duty_status === 'OFF_DUTY' || e.duty_status === 'SLEEPER_BERTH') && dur >= 34.0)) {
      cycleHoursAcc = 0.0;
      shiftDutyStart = null;
      currentShiftDrive = 0.0;
      hoursSinceQualifyingBreak = 0.0;
      continue;
    }

    // 10-hour rest reset
    if (e.type === 'REST_10_HR' || ((e.duty_status === 'OFF_DUTY' || e.duty_status === 'SLEEPER_BERTH') && dur >= 10.0)) {
      shiftDutyStart = null;
      currentShiftDrive = 0.0;
      hoursSinceQualifyingBreak = 0.0;
      continue;
    }

    // 30-min break
    if (dur >= 0.5 && (e.duty_status === 'OFF_DUTY' || e.duty_status === 'SLEEPER_BERTH' || e.type === 'REST_30_MIN')) {
      hoursSinceQualifyingBreak = 0.0;
    }

    // On-duty tracking
    if (e.duty_status === 'DRIVING' || e.duty_status === 'ON_DUTY_NOT_DRIVING') {
      if (shiftDutyStart === null) {
        shiftDutyStart = eStart;
      }

      const elapsedShift = (eEnd.getTime() - shiftDutyStart.getTime()) / (3600 * 1000);
      maxWindowDurationSeen = Math.max(maxWindowDurationSeen, elapsedShift);

      if (e.duty_status === 'DRIVING' && elapsedShift > 14.05) {
        violations.push(
          `14-Hour Window Violation: Event ${e.id} scheduled driving at elapsed ${elapsedShift.toFixed(2)} hrs.`
        );
      }

      cycleHoursAcc += dur;
      maxCycleHoursReached = Math.max(maxCycleHoursReached, cycleHoursAcc);
      if (cycleHoursAcc > 70.05) {
        violations.push(
          `70-Hour Cycle Violation: Cumulative on-duty hours reached ${cycleHoursAcc.toFixed(2)} hrs.`
        );
      }
    }

    if (e.duty_status === 'DRIVING') {
      currentShiftDrive += dur;
      maxDrivingInSingleShift = Math.max(maxDrivingInSingleShift, currentShiftDrive);
      if (currentShiftDrive > 11.05) {
        violations.push(
          `11-Hour Driving Limit Violation: ${currentShiftDrive.toFixed(2)} driving hours in single duty shift.`
        );
      }

      hoursSinceQualifyingBreak += dur;
      maxDrivingBeforeBreak = Math.max(maxDrivingBeforeBreak, hoursSinceQualifyingBreak);
      if (hoursSinceQualifyingBreak > 8.05) {
        violations.push(
          `30-Minute Break Violation: ${hoursSinceQualifyingBreak.toFixed(2)} hrs continuous driving without break.`
        );
      }

      totalMilesAudited += milesCov;
      milesSinceFuel += milesCov;
      maxMilesBetweenFuel = Math.max(maxMilesBetweenFuel, milesSinceFuel);
      if (milesSinceFuel > 1005.0) {
        violations.push(
          `Fuel Interval Exceeded: ${milesSinceFuel.toFixed(1)} miles driven without fueling (limit 1,000 mi).`
        );
      }
    }

    if (e.type === 'FUEL') {
      milesSinceFuel = 0.0;
    }
  }

  if (!pickupFound) {
    violations.push('Missing cargo pickup event.');
  }
  if (!dropoffFound) {
    violations.push('Missing cargo dropoff event.');
  }

  // Daily log sum checks
  const days = plan.days || [];
  for (const d of days) {
    const sum = parseFloat(
      (d.off_duty_hours + d.sleeper_berth_hours + d.driving_hours + d.on_duty_not_driving_hours).toFixed(2)
    );
    if (Math.abs(sum - 24.0) > 0.15) {
      violations.push(`Day ${d.day_number} (${d.date}) hours sum to ${sum}, expected 24.0.`);
    }
  }

  return {
    compliant: violations.length === 0,
    violations,
    warnings,
    metrics: {
      max_shift_driving_hours: parseFloat(maxDrivingInSingleShift.toFixed(2)),
      max_duty_window_hours: parseFloat(maxWindowDurationSeen.toFixed(2)),
      max_continuous_driving_before_break: parseFloat(maxDrivingBeforeBreak.toFixed(2)),
      peak_cycle_hours: parseFloat(maxCycleHoursReached.toFixed(2)),
      max_distance_between_fuel_miles: parseFloat(maxMilesBetweenFuel.toFixed(1)),
      total_miles_audited: parseFloat(totalMilesAudited.toFixed(1)),
      total_days_audited: days.length,
    },
  };
}
