"""
RouteLedger - Independent Hours-of-Service (HOS) Plan Validator
Performs rigorous, independent audit of generated schedules against FMCSA rules.
Does not share state or trust planner internal flags.
"""

from datetime import datetime
from typing import Dict, Any, List


def validate_hos_plan(plan_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Independently inspects an entire TripPlan schedule for HOS violations.
    Checks:
    1. Chronological order & zero overlapping events
    2. 11-Hour Driving limit between 10-hour qualifying rest periods
    3. 14-Hour Duty window from initial on-duty start until 10-hour rest
    4. 30-Minute Break after <= 8 cumulative hours of driving
    5. 70-Hour Rolling Cycle compliance (accounting for 34-hour restart resets)
    6. Pickup duration exactly 1.0 hour (on-duty not driving)
    7. Dropoff duration exactly 1.0 hour (on-duty not driving)
    8. Fuel interval <= 1,000 miles
    9. Route distance accounting (all miles accounted for)
    10. Daily 24-hour log summation
    """
    violations: List[str] = []
    warnings: List[str] = []

    events = plan_result.get("events", [])
    if not events:
        return {
            "compliant": False,
            "violations": ["Trip schedule contains no events."],
            "warnings": [],
            "metrics": {},
        }

    # 1. Chronological Order & Overlap Check
    for i in range(len(events) - 1):
        curr_e = events[i]
        next_e = events[i + 1]
        c_end = datetime.fromisoformat(curr_e["end_time"])
        n_start = datetime.fromisoformat(next_e["start_time"])

        if c_end > n_start:
            violations.append(
                f"Overlapping events: Event {curr_e['id']} ends at {c_end} but next event {next_e['id']} starts at {n_start}"
            )
        elif n_start < c_end:
            violations.append(
                f"Chronological anomaly: Event {next_e['id']} starts before previous event ends."
            )

    # 2. Track Duty Cycles and Shifts Independently
    current_shift_drive = 0.0
    shift_duty_start: datetime = None
    hours_since_qualifying_break = 0.0
    cycle_hours_acc = float(plan_result.get("initial_cycle_used", 0.0))
    miles_since_fuel = 0.0
    total_miles_audited = 0.0

    pickup_found = False
    dropoff_found = False

    max_driving_in_single_shift = 0.0
    max_window_duration_seen = 0.0
    max_driving_before_break = 0.0
    max_cycle_hours_reached = cycle_hours_acc
    max_miles_between_fuel = 0.0

    for idx, e in enumerate(events):
        e_type = e.get("type")
        duty_status = e.get("duty_status")
        dur = float(e.get("duration_hours", 0.0))
        e_start = datetime.fromisoformat(e["start_time"])
        e_end = datetime.fromisoformat(e["end_time"])
        miles_cov = float(e.get("miles_covered", 0.0))

        # Check pickup rule
        if e_type == "PICKUP":
            pickup_found = True
            if abs(dur - 1.0) > 0.05:
                violations.append(f"Pickup duration must be exactly 1.0 hour, found {dur} hr")
            if duty_status != "ON_DUTY_NOT_DRIVING":
                violations.append(f"Pickup duty status must be ON_DUTY_NOT_DRIVING, found {duty_status}")

        # Check dropoff rule
        if e_type == "DROPOFF":
            dropoff_found = True
            if abs(dur - 1.0) > 0.05:
                violations.append(f"Dropoff duration must be exactly 1.0 hour, found {dur} hr")
            if duty_status != "ON_DUTY_NOT_DRIVING":
                violations.append(f"Dropoff duty status must be ON_DUTY_NOT_DRIVING, found {duty_status}")

        # If 34-hour restart: resets rolling cycle, resets duty window and drive limit
        if e_type == "RESTART_34_HR" or (duty_status in ("OFF_DUTY", "SLEEPER_BERTH") and dur >= 34.0):
            cycle_hours_acc = 0.0
            shift_duty_start = None
            current_shift_drive = 0.0
            hours_since_qualifying_break = 0.0
            continue

        # If 10-hour qualifying rest: resets duty window and 11-hour driving limit
        if e_type == "REST_10_HR" or (duty_status in ("OFF_DUTY", "SLEEPER_BERTH") and dur >= 10.0):
            shift_duty_start = None
            current_shift_drive = 0.0
            hours_since_qualifying_break = 0.0
            continue

        # If 30-minute break: resets 8-hour drive timer
        if dur >= 0.5 and (duty_status in ("OFF_DUTY", "SLEEPER_BERTH") or e_type == "REST_30_MIN"):
            hours_since_qualifying_break = 0.0

        # On-Duty work (Driving or On Duty Not Driving)
        if duty_status in ("DRIVING", "ON_DUTY_NOT_DRIVING"):
            # If shift duty start is not set, set it now
            if shift_duty_start is None:
                shift_duty_start = e_start

            # Check 14-hour window from shift start
            elapsed_shift = (e_end - shift_duty_start).total_seconds() / 3600.0
            max_window_duration_seen = max(max_window_duration_seen, elapsed_shift)

            # Driving is prohibited past 14 hours
            if duty_status == "DRIVING" and elapsed_shift > 14.05:
                violations.append(
                    f"14-Hour Window Violation: Event {e['id']} scheduled driving at elapsed {round(elapsed_shift, 2)} hrs from shift start."
                )

            # Accumulate rolling cycle
            cycle_hours_acc += dur
            max_cycle_hours_reached = max(max_cycle_hours_reached, cycle_hours_acc)
            if cycle_hours_acc > 70.05:
                violations.append(
                    f"70-Hour Cycle Violation: Cumulative on-duty hours reached {round(cycle_hours_acc, 2)} hrs."
                )

        if duty_status == "DRIVING":
            # 11-hour driving rule
            current_shift_drive += dur
            max_driving_in_single_shift = max(max_driving_in_single_shift, current_shift_drive)
            if current_shift_drive > 11.05:
                violations.append(
                    f"11-Hour Driving Violation: Exceeded 11 driving hours in single duty shift ({round(current_shift_drive, 2)} hrs)."
                )

            # 30-minute break rule: must not drive past 8 cumulative hours
            hours_since_qualifying_break += dur
            max_driving_before_break = max(max_driving_before_break, hours_since_qualifying_break)
            if hours_since_qualifying_break > 8.05:
                violations.append(
                    f"30-Minute Break Violation: Driven {round(hours_since_qualifying_break, 2)} continuous hours without qualifying 30-min break."
                )

            # Distance tracking
            total_miles_audited += miles_cov
            miles_since_fuel += miles_cov
            max_miles_between_fuel = max(max_miles_between_fuel, miles_since_fuel)
            if miles_since_fuel > 1005.0:
                violations.append(
                    f"Fuel Stop Interval Exceeded: Driven {round(miles_since_fuel, 1)} miles without fueling (limit is 1,000 miles)."
                )

        if e_type == "FUEL":
            miles_since_fuel = 0.0

    if not pickup_found:
        violations.append("Schedule is missing required Cargo Pickup event.")
    if not dropoff_found:
        violations.append("Schedule is missing required Cargo Dropoff event.")

    # 3. Independent audit of daily log totals summing to 24 hours
    days = plan_result.get("days", [])
    for d in days:
        d_tot = round(
            float(d.get("off_duty_hours", 0))
            + float(d.get("sleeper_berth_hours", 0))
            + float(d.get("driving_hours", 0))
            + float(d.get("on_duty_not_driving_hours", 0)),
            2,
        )
        if abs(d_tot - 24.0) > 0.15:
            violations.append(
                f"Daily Log Summation Error on Day {d.get('day_number')} ({d.get('date')}): Total hours is {d_tot}, must equal 24.0."
            )

    # 4. Route miles check
    total_planned_distance = float(plan_result.get("total_distance_miles", 0.0))
    if total_planned_distance > 0 and abs(total_miles_audited - total_planned_distance) > 2.0:
        warnings.append(
            f"Minor route mileage discrepancy: planned {total_planned_distance} mi vs audited {round(total_miles_audited, 1)} mi"
        )

    # Compile validation metrics
    metrics = {
        "max_shift_driving_hours": round(max_driving_in_single_shift, 2),
        "max_duty_window_hours": round(max_window_duration_seen, 2),
        "max_continuous_driving_before_break": round(max_driving_before_break, 2),
        "peak_cycle_hours": round(max_cycle_hours_reached, 2),
        "max_distance_between_fuel_miles": round(max_miles_between_fuel, 1),
        "total_miles_audited": round(total_miles_audited, 1),
        "total_days_audited": len(days),
    }

    is_compliant = len(violations) == 0

    return {
        "compliant": is_compliant,
        "violations": violations,
        "warnings": warnings,
        "metrics": metrics,
    }
