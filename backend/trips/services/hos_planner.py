"""
RouteLedger - Commercial Driver Hours-of-Service (HOS) Planning Engine
Deterministic event-based simulation implementing FMCSA 49 CFR Part 395 rules for property-carrying CMVs.

Rules implemented:
1. 11-Hour Driving Limit: Driver may drive a maximum of 11 hours after 10 consecutive hours off-duty.
2. 14-Hour Duty Window: Once duty begins, driver cannot drive after the 14th consecutive hour. Off-duty time does not pause/extend this window.
3. 30-Minute Break: Driving requires a qualifying >=30 min break after 8 cumulative hours of driving.
4. 70-Hour / 8-Day Limit: Rolling cycle tracking. On-duty time (driving + on-duty not driving) cannot exceed 70 hours.
5. 34-Hour Restart: When remaining cycle is insufficient, a 34-hour off-duty restart resets cycle hours to 0.
6. Pickup: Exactly 1 hour on-duty not driving.
7. Dropoff: Exactly 1 hour on-duty not driving.
8. Fueling: At least once every 1,000 miles (default 30 mins on-duty not driving).
"""

from datetime import datetime, timedelta
import math
from typing import List, Dict, Any, Optional, Tuple


class DutyStatus:
    OFF_DUTY = "OFF_DUTY"
    SLEEPER_BERTH = "SLEEPER_BERTH"
    DRIVING = "DRIVING"
    ON_DUTY_NOT_DRIVING = "ON_DUTY_NOT_DRIVING"


class EventType:
    PICKUP = "PICKUP"
    DRIVING = "DRIVING"
    REST_30_MIN = "REST_30_MIN"
    FUEL = "FUEL"
    REST_10_HR = "REST_10_HR"
    RESTART_34_HR = "RESTART_34_HR"
    DROPOFF = "DROPOFF"
    OFF_DUTY_BUFFER = "OFF_DUTY_BUFFER"


class HOSConfig:
    def __init__(
        self,
        pickup_duration_hours: float = 1.0,
        dropoff_duration_hours: float = 1.0,
        fuel_interval_miles: float = 1000.0,
        fuel_duration_hours: float = 0.5,
        break_duration_hours: float = 0.5,
        daily_driving_limit_hours: float = 11.0,
        daily_duty_window_hours: float = 14.0,
        cycle_limit_hours: float = 70.0,
        qualifying_rest_hours: float = 10.0,
        restart_duration_hours: float = 34.0,
        allow_sleeper_berth: bool = False,
    ):
        self.pickup_duration_hours = pickup_duration_hours
        self.dropoff_duration_hours = dropoff_duration_hours
        self.fuel_interval_miles = fuel_interval_miles
        self.fuel_duration_hours = fuel_duration_hours
        self.break_duration_hours = break_duration_hours
        self.daily_driving_limit_hours = daily_driving_limit_hours
        self.daily_duty_window_hours = daily_duty_window_hours
        self.cycle_limit_hours = cycle_limit_hours
        self.qualifying_rest_hours = qualifying_rest_hours
        self.restart_duration_hours = restart_duration_hours
        self.allow_sleeper_berth = allow_sleeper_berth


def parse_iso_or_default(dt_str: Optional[str], default_hour: int = 6) -> datetime:
    if dt_str:
        try:
            # Handle ISO string with or without Z
            cleaned = dt_str.replace("Z", "+00:00")
            return datetime.fromisoformat(cleaned)
        except Exception:
            pass
    now = datetime.now()
    return datetime(now.year, now.month, now.day, default_hour, 0, 0)


def interpolate_coordinates(
    coords: List[List[float]], fraction: float
) -> Tuple[float, float]:
    """Interpolate [lat, lng] along route coordinates array at given fraction (0.0 to 1.0)."""
    if not coords:
        return (37.5407, -77.4360)  # Default fallback
    if len(coords) == 1 or fraction <= 0:
        return (coords[0][1], coords[0][0])
    if fraction >= 1.0:
        return (coords[-1][1], coords[-1][0])

    idx = fraction * (len(coords) - 1)
    i0 = int(math.floor(idx))
    i1 = min(i0 + 1, len(coords) - 1)
    remainder = idx - i0

    p0 = coords[i0]
    p1 = coords[i1]
    # In GeoJSON, coords are [lng, lat]
    lat = p0[1] + (p1[1] - p0[1]) * remainder
    lng = p0[0] + (p1[0] - p0[0]) * remainder
    return (round(lat, 5), round(lng, 5))


class HOSPlanner:
    def __init__(self, config: Optional[HOSConfig] = None):
        self.config = config or HOSConfig()

    def plan_trip(
        self,
        origin: Dict[str, Any],
        pickup: Dict[str, Any],
        destination: Dict[str, Any],
        total_distance_miles: float,
        total_duration_hours: float,
        current_cycle_used: float,
        departure_time: datetime,
        route_geometry: Optional[List[List[float]]] = None,
        route_steps: Optional[List[Dict[str, Any]]] = None,
        intermediate_stops: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Execute deterministic event-based simulation of commercial trip.
        Produces structured schedule events, day-by-day plans, stop markers, and compliance status.
        """
        events: List[Dict[str, Any]] = []
        stops: List[Dict[str, Any]] = []
        warnings: List[str] = []
        violations: List[str] = []

        cfg = self.config
        current_time = departure_time
        duty_window_start: Optional[datetime] = None
        driving_in_current_window = 0.0
        hours_since_last_break = 0.0
        cycle_hours_used = float(current_cycle_used)
        miles_since_fuel = 0.0
        total_miles_driven = 0.0

        # Average driving speed (mph) based on OSRM calculation (bounded safely)
        effective_duration = max(total_duration_hours, 0.1)
        average_speed_mph = total_distance_miles / effective_duration
        if average_speed_mph < 20.0:
            average_speed_mph = 52.0
        elif average_speed_mph > 70.0:
            average_speed_mph = 62.0

        coords = route_geometry or []

        def add_event(
            event_type: str,
            duration_hours: float,
            duty_status: str,
            description: str,
            location_name: str,
            lat: float,
            lng: float,
            miles_covered: float = 0.0,
            start_override: Optional[datetime] = None,
        ) -> Dict[str, Any]:
            nonlocal current_time
            start = start_override or current_time
            end = start + timedelta(hours=duration_hours)
            evt = {
                "id": f"evt-{len(events) + 1}",
                "type": event_type,
                "duty_status": duty_status,
                "start_time": start.isoformat(),
                "end_time": end.isoformat(),
                "duration_hours": round(duration_hours, 3),
                "location_name": location_name,
                "latitude": lat,
                "longitude": lng,
                "description": description,
                "miles_covered": round(miles_covered, 2),
                "cumulative_miles": round(total_miles_driven, 2),
                "cycle_hours_used_after": round(cycle_hours_used, 2),
            }
            events.append(evt)
            current_time = end
            return evt

        # Step 1: Add Origin Departure / Setup if distinct
        orig_lat = origin.get("latitude", 0.0)
        orig_lng = origin.get("longitude", 0.0)
        orig_name = origin.get("display_name", "Origin")

        # Step 2: Pickup Event (1 hour on-duty not driving)
        pickup_lat = pickup.get("latitude", orig_lat)
        pickup_lng = pickup.get("longitude", orig_lng)
        pickup_name = pickup.get("display_name", orig_name)

        # If current cycle cannot accommodate pickup (e.g. 70 hrs used), take 34-hr restart first
        if cycle_hours_used + cfg.pickup_duration_hours > cfg.cycle_limit_hours:
            restart_hours = cfg.restart_duration_hours
            add_event(
                event_type=EventType.RESTART_34_HR,
                duration_hours=restart_hours,
                duty_status=DutyStatus.OFF_DUTY,
                description="34-Hour Qualifying Restart (Required prior to dispatch due to exhausted cycle)",
                location_name=orig_name,
                lat=orig_lat,
                lng=orig_lng,
            )
            stops.append({
                "stop_type": "RESTART_34_HR",
                "name": f"{orig_name} Facility",
                "latitude": orig_lat,
                "longitude": orig_lng,
                "arrival_time": events[-1]["start_time"],
                "departure_time": events[-1]["end_time"],
                "duration_minutes": int(restart_hours * 60),
                "duty_status": DutyStatus.OFF_DUTY,
                "reason": "34-hour restart to reset rolling 70-hour cycle before dispatch",
            })
            cycle_hours_used = 0.0

        # Duty window starts upon beginning on-duty work
        duty_window_start = current_time
        cycle_hours_used += cfg.pickup_duration_hours

        pickup_event = add_event(
            event_type=EventType.PICKUP,
            duration_hours=cfg.pickup_duration_hours,
            duty_status=DutyStatus.ON_DUTY_NOT_DRIVING,
            description="Cargo pickup & loading inspection",
            location_name=pickup_name,
            lat=pickup_lat,
            lng=pickup_lng,
            miles_covered=0.0,
        )

        stops.append({
            "stop_type": "PICKUP",
            "name": pickup_name,
            "latitude": pickup_lat,
            "longitude": pickup_lng,
            "arrival_time": pickup_event["start_time"],
            "departure_time": pickup_event["end_time"],
            "duration_minutes": int(cfg.pickup_duration_hours * 60),
            "duty_status": DutyStatus.ON_DUTY_NOT_DRIVING,
            "reason": "Freight loading, securement, and documentation (1.0 hr)",
        })

        # Step 3: Event Simulation for Driving to Destination
        remaining_route_miles = total_distance_miles
        step_safety_counter = 0
        max_iterations = 250  # Prevent infinite loop

        while remaining_route_miles > 0.01 and step_safety_counter < max_iterations:
            step_safety_counter += 1

            # Check if 34-hour restart is required due to exhausted 70-hour cycle
            remaining_cycle = cfg.cycle_limit_hours - cycle_hours_used
            if remaining_cycle < 0.25:
                # Cycle exhausted: insert 34-hour restart
                restart_hours = cfg.restart_duration_hours
                curr_lat, curr_lng = interpolate_coordinates(
                    coords, total_miles_driven / max(total_distance_miles, 1.0)
                )
                loc_name = f"Mile {int(total_miles_driven)} Safe Haven"
                add_event(
                    event_type=EventType.RESTART_34_HR,
                    duration_hours=restart_hours,
                    duty_status=DutyStatus.OFF_DUTY,
                    description="34-Hour Qualifying Restart (Resets 70-Hour / 8-Day Cycle)",
                    location_name=loc_name,
                    lat=curr_lat,
                    lng=curr_lng,
                )
                stops.append({
                    "stop_type": "RESTART_34_HR",
                    "name": loc_name,
                    "latitude": curr_lat,
                    "longitude": curr_lng,
                    "arrival_time": events[-1]["start_time"],
                    "departure_time": events[-1]["end_time"],
                    "duration_minutes": int(restart_hours * 60),
                    "duty_status": DutyStatus.OFF_DUTY,
                    "reason": "34-hour restart to reset rolling 70-hour cycle",
                })
                # Reset state
                cycle_hours_used = 0.0
                duty_window_start = None
                driving_in_current_window = 0.0
                hours_since_last_break = 0.0
                continue

            # Check if duty window has expired or 11 hours driven
            if duty_window_start is not None:
                elapsed_in_window = (current_time - duty_window_start).total_seconds() / 3600.0
                window_left = cfg.daily_duty_window_hours - elapsed_in_window
                drive_left_in_window = cfg.daily_driving_limit_hours - driving_in_current_window
            else:
                window_left = cfg.daily_duty_window_hours
                drive_left_in_window = cfg.daily_driving_limit_hours

            # If no driving window left or 11 hr limit reached -> Insert 10-hour rest
            if window_left <= 0.05 or drive_left_in_window <= 0.05:
                rest_duration = cfg.qualifying_rest_hours
                rest_status = (
                    DutyStatus.SLEEPER_BERTH
                    if cfg.allow_sleeper_berth
                    else DutyStatus.OFF_DUTY
                )
                curr_lat, curr_lng = interpolate_coordinates(
                    coords, total_miles_driven / max(total_distance_miles, 1.0)
                )
                loc_name = f"Mile {int(total_miles_driven)} Truck Rest Area"
                add_event(
                    event_type=EventType.REST_10_HR,
                    duration_hours=rest_duration,
                    duty_status=rest_status,
                    description="10-Hour Mandatory Off-Duty / Sleeper Rest Period",
                    location_name=loc_name,
                    lat=curr_lat,
                    lng=curr_lng,
                )
                stops.append({
                    "stop_type": "REST_10_HR",
                    "name": loc_name,
                    "latitude": curr_lat,
                    "longitude": curr_lng,
                    "arrival_time": events[-1]["start_time"],
                    "departure_time": events[-1]["end_time"],
                    "duration_minutes": int(rest_duration * 60),
                    "duty_status": rest_status,
                    "reason": "10-hour qualifying rest (resets 11-hour drive & 14-hour window)",
                })
                # Reset duty window & driving limit
                duty_window_start = None
                driving_in_current_window = 0.0
                hours_since_last_break = 0.0
                continue

            # Check if 30-minute break is due (after 8 cumulative hours of driving)
            break_left = 8.0 - hours_since_last_break
            if break_left <= 0.05:
                curr_lat, curr_lng = interpolate_coordinates(
                    coords, total_miles_driven / max(total_distance_miles, 1.0)
                )
                loc_name = f"Mile {int(total_miles_driven)} Travel Center"
                add_event(
                    event_type=EventType.REST_30_MIN,
                    duration_hours=cfg.break_duration_hours,
                    duty_status=DutyStatus.OFF_DUTY,
                    description="Mandatory 30-Minute Rest Break (8-Hour Cumulative Drive Rule)",
                    location_name=loc_name,
                    lat=curr_lat,
                    lng=curr_lng,
                )
                stops.append({
                    "stop_type": "REST_30_MIN",
                    "name": loc_name,
                    "latitude": curr_lat,
                    "longitude": curr_lng,
                    "arrival_time": events[-1]["start_time"],
                    "departure_time": events[-1]["end_time"],
                    "duration_minutes": int(cfg.break_duration_hours * 60),
                    "duty_status": DutyStatus.OFF_DUTY,
                    "reason": "30-minute off-duty break required after 8 hrs cumulative driving",
                })
                hours_since_last_break = 0.0
                # Off-duty break DOES NOT extend the 14-hour window
                continue

            # Check if fuel stop is due (every 1000 miles)
            miles_until_fuel = cfg.fuel_interval_miles - miles_since_fuel
            if miles_until_fuel <= 1.0:
                curr_lat, curr_lng = interpolate_coordinates(
                    coords, total_miles_driven / max(total_distance_miles, 1.0)
                )
                loc_name = f"Mile {int(total_miles_driven)} Fuel Plaza"
                cycle_hours_used += cfg.fuel_duration_hours
                add_event(
                    event_type=EventType.FUEL,
                    duration_hours=cfg.fuel_duration_hours,
                    duty_status=DutyStatus.ON_DUTY_NOT_DRIVING,
                    description="Commercial Fueling & Equipment Inspection",
                    location_name=loc_name,
                    lat=curr_lat,
                    lng=curr_lng,
                )
                stops.append({
                    "stop_type": "FUEL",
                    "name": loc_name,
                    "latitude": curr_lat,
                    "longitude": curr_lng,
                    "arrival_time": events[-1]["start_time"],
                    "departure_time": events[-1]["end_time"],
                    "duration_minutes": int(cfg.fuel_duration_hours * 60),
                    "duty_status": DutyStatus.ON_DUTY_NOT_DRIVING,
                    "reason": "Commercial fueling (< 1,000 mile mandatory interval)",
                })
                miles_since_fuel = 0.0
                continue

            # If starting a new shift driving, set duty_window_start
            if duty_window_start is None:
                duty_window_start = current_time

            # Compute maximum driving time legally available right now
            elapsed = (current_time - duty_window_start).total_seconds() / 3600.0
            legal_window_drive = max(0.0, cfg.daily_duty_window_hours - elapsed)
            legal_11hr_drive = max(0.0, cfg.daily_driving_limit_hours - driving_in_current_window)
            legal_break_drive = max(0.0, 8.0 - hours_since_last_break)
            legal_cycle_drive = max(0.0, cfg.cycle_limit_hours - cycle_hours_used)
            legal_fuel_drive = miles_until_fuel / average_speed_mph

            # Estimated time needed for remaining trip
            needed_trip_drive = remaining_route_miles / average_speed_mph

            # Drive duration is the smallest constraint
            drive_hours = min(
                needed_trip_drive,
                legal_window_drive,
                legal_11hr_drive,
                legal_break_drive,
                legal_cycle_drive,
                legal_fuel_drive,
            )

            # Safeguard minimum chunk (at least ~6 minutes or remaining)
            if drive_hours <= 0.02:
                # Can't drive further in this duty window/shift
                continue

            # Drive for drive_hours
            distance_chunk = min(remaining_route_miles, drive_hours * average_speed_mph)
            start_miles = total_miles_driven
            total_miles_driven += distance_chunk
            remaining_route_miles -= distance_chunk

            driving_in_current_window += drive_hours
            hours_since_last_break += drive_hours
            cycle_hours_used += drive_hours
            miles_since_fuel += distance_chunk

            curr_lat, curr_lng = interpolate_coordinates(
                coords, total_miles_driven / max(total_distance_miles, 1.0)
            )
            seg_desc = f"Transit mile {int(start_miles)} to {int(total_miles_driven)} ({round(distance_chunk, 1)} mi @ {int(average_speed_mph)} mph)"

            add_event(
                event_type=EventType.DRIVING,
                duration_hours=drive_hours,
                duty_status=DutyStatus.DRIVING,
                description=seg_desc,
                location_name=f"In Transit (Mile {int(total_miles_driven)})",
                lat=curr_lat,
                lng=curr_lng,
                miles_covered=distance_chunk,
            )

        # Step 4: Dropoff Event (1 hour on-duty not driving)
        dest_lat = destination.get("latitude", pickup_lat)
        dest_lng = destination.get("longitude", pickup_lng)
        dest_name = destination.get("display_name", "Destination")

        cycle_hours_used += cfg.dropoff_duration_hours
        dropoff_event = add_event(
            event_type=EventType.DROPOFF,
            duration_hours=cfg.dropoff_duration_hours,
            duty_status=DutyStatus.ON_DUTY_NOT_DRIVING,
            description="Cargo unloading, receiver check-in, and delivery sign-off",
            location_name=dest_name,
            lat=dest_lat,
            lng=dest_lng,
            miles_covered=0.0,
        )

        stops.append({
            "stop_type": "DROPOFF",
            "name": dest_name,
            "latitude": dest_lat,
            "longitude": dest_lng,
            "arrival_time": dropoff_event["start_time"],
            "departure_time": dropoff_event["end_time"],
            "duration_minutes": int(cfg.dropoff_duration_hours * 60),
            "duty_status": DutyStatus.ON_DUTY_NOT_DRIVING,
            "reason": "Final freight unloading and delivery sign-off (1.0 hr)",
        })

        # Calculate Day-by-Day breakdown and total duration
        total_trip_duration_hours = (current_time - departure_time).total_seconds() / 3600.0

        # Build day-by-day logs slicing at calendar midnights
        days = self._build_daily_breakdown(events, departure_time, current_time)

        # Count stops by type
        break_stops_count = sum(1 for s in stops if s["stop_type"] == "REST_30_MIN")
        fuel_stops_count = sum(1 for s in stops if s["stop_type"] == "FUEL")
        rest_10hr_count = sum(1 for s in stops if s["stop_type"] == "REST_10_HR")
        restart_count = sum(1 for s in stops if s["stop_type"] == "RESTART_34_HR")

        summary = {
            "origin": origin,
            "pickup": pickup,
            "destination": destination,
            "total_distance_miles": round(total_distance_miles, 2),
            "total_drive_hours": round(sum(e["duration_hours"] for e in events if e["duty_status"] == DutyStatus.DRIVING), 2),
            "estimated_total_duration_hours": round(total_trip_duration_hours, 2),
            "start_time": departure_time.isoformat(),
            "end_time": current_time.isoformat(),
            "initial_cycle_used": float(current_cycle_used),
            "final_cycle_used": round(cycle_hours_used, 2),
            "cycle_remaining_hours": max(0.0, round(cfg.cycle_limit_hours - cycle_hours_used, 2)),
            "days_count": len(days),
            "counts": {
                "rest_30_min": break_stops_count,
                "fuel_stops": fuel_stops_count,
                "rest_10_hr": rest_10hr_count,
                "restarts_34_hr": restart_count,
            },
            "events": events,
            "stops": stops,
            "days": days,
            "route_geometry": coords,
            "route_steps": route_steps or [],
            "warnings": warnings,
            "violations": violations,
        }

        return summary

    def _build_daily_breakdown(
        self,
        events: List[Dict[str, Any]],
        trip_start: datetime,
        trip_end: datetime,
    ) -> List[Dict[str, Any]]:
        """
        Split continuous schedule events across calendar days (midnight to midnight).
        Each calendar day sums to exactly 24.0 hours.
        """
        if not events:
            return []

        # Find earliest day and latest day
        start_date = trip_start.date()
        end_date = trip_end.date()

        days_list: List[Dict[str, Any]] = []
        cur_date = start_date

        while cur_date <= end_date:
            day_start = datetime(cur_date.year, cur_date.month, cur_date.day, 0, 0, 0)
            day_end = day_start + timedelta(days=1)

            day_events: List[Dict[str, Any]] = []

            # Check if trip has not yet started at day_start (e.g. Day 1 starts at 06:00)
            if trip_start > day_start and cur_date == start_date:
                pre_trip_hours = (trip_start - day_start).total_seconds() / 3600.0
                if pre_trip_hours > 0:
                    day_events.append({
                        "id": f"day-{len(days_list) + 1}-pre",
                        "type": EventType.OFF_DUTY_BUFFER,
                        "duty_status": DutyStatus.OFF_DUTY,
                        "start_time": day_start.isoformat(),
                        "end_time": trip_start.isoformat(),
                        "duration_hours": round(pre_trip_hours, 4),
                        "location_name": events[0]["location_name"],
                        "description": "Off Duty Prior to Scheduled Dispatch",
                        "miles_covered": 0.0,
                    })

            for e in events:
                e_start = datetime.fromisoformat(e["start_time"])
                e_end = datetime.fromisoformat(e["end_time"])

                # Overlap test with [day_start, day_end]
                overlap_start = max(day_start, e_start)
                overlap_end = min(day_end, e_end)

                if overlap_end > overlap_start:
                    dur_hours = (overlap_end - overlap_start).total_seconds() / 3600.0
                    fraction = dur_hours / max(e["duration_hours"], 0.0001)
                    sliced_miles = e.get("miles_covered", 0.0) * min(1.0, fraction)

                    day_events.append({
                        "id": f"{e['id']}-{cur_date.strftime('%Y%m%d')}",
                        "original_event_id": e["id"],
                        "type": e["type"],
                        "duty_status": e["duty_status"],
                        "start_time": overlap_start.isoformat(),
                        "end_time": overlap_end.isoformat(),
                        "duration_hours": round(dur_hours, 4),
                        "location_name": e["location_name"],
                        "latitude": e.get("latitude"),
                        "longitude": e.get("longitude"),
                        "description": e["description"],
                        "miles_covered": round(sliced_miles, 2),
                    })

            # Check if trip ended before day_end on final day
            if trip_end < day_end and cur_date == end_date:
                post_trip_hours = (day_end - trip_end).total_seconds() / 3600.0
                if post_trip_hours > 0:
                    day_events.append({
                        "id": f"day-{len(days_list) + 1}-post",
                        "type": EventType.OFF_DUTY_BUFFER,
                        "duty_status": DutyStatus.OFF_DUTY,
                        "start_time": trip_end.isoformat(),
                        "end_time": day_end.isoformat(),
                        "duration_hours": round(post_trip_hours, 4),
                        "location_name": events[-1]["location_name"],
                        "description": "Off Duty Following Trip Delivery",
                        "miles_covered": 0.0,
                    })

            # Sum daily totals
            off_duty_hrs = sum(ev["duration_hours"] for ev in day_events if ev["duty_status"] == DutyStatus.OFF_DUTY)
            sleeper_hrs = sum(ev["duration_hours"] for ev in day_events if ev["duty_status"] == DutyStatus.SLEEPER_BERTH)
            driving_hrs = sum(ev["duration_hours"] for ev in day_events if ev["duty_status"] == DutyStatus.DRIVING)
            on_duty_hrs = sum(ev["duration_hours"] for ev in day_events if ev["duty_status"] == DutyStatus.ON_DUTY_NOT_DRIVING)
            daily_miles = sum(ev.get("miles_covered", 0.0) for ev in day_events)

            # Generate structured remarks for status changes
            remarks: List[Dict[str, Any]] = []
            for ev in day_events:
                t_dt = datetime.fromisoformat(ev["start_time"])
                time_str = t_dt.strftime("%H:%M")
                remarks.append({
                    "time": time_str,
                    "location": ev["location_name"],
                    "status": ev["duty_status"],
                    "description": ev["description"],
                })

            days_list.append({
                "day_number": len(days_list) + 1,
                "date": cur_date.strftime("%Y-%m-%d"),
                "total_hours": round(off_duty_hrs + sleeper_hrs + driving_hrs + on_duty_hrs, 2),
                "off_duty_hours": round(off_duty_hrs, 2),
                "sleeper_berth_hours": round(sleeper_hrs, 2),
                "driving_hours": round(driving_hrs, 2),
                "on_duty_not_driving_hours": round(on_duty_hrs, 2),
                "total_on_duty_hours": round(driving_hrs + on_duty_hrs, 2),
                "total_miles_driving_today": round(daily_miles, 2),
                "events": day_events,
                "remarks": remarks,
            })

            cur_date += timedelta(days=1)

        return days_list
