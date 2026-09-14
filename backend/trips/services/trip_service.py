"""
RouteLedger - Trip Orchestrator Service
Coordinates geocoding, OSRM routing, HOS planning, independent validation, and ELD log generation.
"""

from datetime import datetime
import uuid
from typing import Dict, Any, Optional

from .geocoding_service import GeocodingService
from .routing_service import RoutingService
from .hos_planner import HOSPlanner, HOSConfig, parse_iso_or_default
from .hos_validator import validate_hos_plan
from .log_generator import ELDLogGenerator


class TripService:
    @staticmethod
    def plan_commercial_trip(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main pipeline:
        1. Resolve Origin, Pickup, and Destination locations.
        2. Call OSRM for actual road distance, duration, geometry, and turn-by-turn steps.
        3. Run deterministic HOS simulation (11h drive, 14h window, 30m rest, 70h/8d cycle, 1000m fuel, 34h restart).
        4. Run independent HOS validator.
        5. Generate daily ELD RODS log sheets.
        6. Return complete structured response.
        """
        origin_input = payload.get("origin") or "Richmond, Virginia"
        pickup_input = payload.get("pickup") or origin_input
        destination_input = payload.get("destination") or "Newark, New Jersey"
        current_cycle_used = float(payload.get("current_cycle_used", 0.0))
        departure_time_str = payload.get("departure_time")
        carrier_info = payload.get("carrier_info", {})
        config_dict = payload.get("settings", {})

        # Parse departure time
        departure_dt = parse_iso_or_default(departure_time_str, default_hour=6)

        # 1. Resolve locations
        origin_loc = TripService._resolve_location(origin_input, "Richmond, VA", 37.5407, -77.4360)
        pickup_loc = TripService._resolve_location(pickup_input, origin_loc["display_name"], origin_loc["latitude"], origin_loc["longitude"])
        dest_loc = TripService._resolve_location(destination_input, "Newark, NJ", 40.7357, -74.1724)

        # 2. Get road route from OSRM
        waypoints = [
            (origin_loc["latitude"], origin_loc["longitude"]),
        ]
        # Only add pickup waypoint if distinct from origin
        dist_orig_pick = abs(origin_loc["latitude"] - pickup_loc["latitude"]) + abs(origin_loc["longitude"] - pickup_loc["longitude"])
        if dist_orig_pick > 0.001:
            waypoints.append((pickup_loc["latitude"], pickup_loc["longitude"]))
        waypoints.append((dest_loc["latitude"], dest_loc["longitude"]))

        route_data = RoutingService.get_route(waypoints=waypoints, overview="full", steps=True)
        total_dist_mi = route_data.get("distance_miles", 340.0)
        total_dur_hr = route_data.get("duration_hours", 5.8)
        geometry = route_data.get("geometry", [])
        steps = route_data.get("steps", [])

        # 3. Configure HOS Planner
        hos_cfg = HOSConfig(
            pickup_duration_hours=float(config_dict.get("pickup_duration_hours", 1.0)),
            dropoff_duration_hours=float(config_dict.get("dropoff_duration_hours", 1.0)),
            fuel_interval_miles=float(config_dict.get("fuel_interval_miles", 1000.0)),
            fuel_duration_hours=float(config_dict.get("fuel_duration_hours", 0.5)),
            break_duration_hours=float(config_dict.get("break_duration_hours", 0.5)),
            daily_driving_limit_hours=float(config_dict.get("daily_driving_limit_hours", 11.0)),
            daily_duty_window_hours=float(config_dict.get("daily_duty_window_hours", 14.0)),
            cycle_limit_hours=float(config_dict.get("cycle_limit_hours", 70.0)),
            qualifying_rest_hours=float(config_dict.get("qualifying_rest_hours", 10.0)),
            restart_duration_hours=float(config_dict.get("restart_duration_hours", 34.0)),
            allow_sleeper_berth=bool(config_dict.get("allow_sleeper_berth", False)),
        )

        planner = HOSPlanner(config=hos_cfg)
        trip_plan = planner.plan_trip(
            origin=origin_loc,
            pickup=pickup_loc,
            destination=dest_loc,
            total_distance_miles=total_dist_mi,
            total_duration_hours=total_dur_hr,
            current_cycle_used=current_cycle_used,
            departure_time=departure_dt,
            route_geometry=geometry,
            route_steps=steps,
        )

        # 4. Independent Validation
        validation_result = validate_hos_plan(trip_plan)
        trip_plan["validation"] = validation_result
        trip_plan["is_compliant"] = validation_result.get("compliant", False)
        trip_plan["compliance_status"] = (
            "COMPLIANT" if validation_result.get("compliant") else "VIOLATION"
        )
        if not validation_result.get("compliant"):
            trip_plan["violations"] = validation_result.get("violations", [])

        # 5. Generate ELD/RODS Daily Logs
        daily_logs = ELDLogGenerator.generate_daily_logs(trip_plan["days"], carrier_info)
        trip_plan["daily_logs"] = daily_logs

        # 6. Attach trip ID and metadata
        trip_id = str(uuid.uuid4())[:8]
        trip_plan["id"] = trip_id
        trip_plan["created_at"] = datetime.now().isoformat()

        return trip_plan

    @staticmethod
    def _resolve_location(loc_input: Any, fallback_name: str, fallback_lat: float, fallback_lng: float) -> Dict[str, Any]:
        """Resolves string or dict into {display_name, latitude, longitude}."""
        if isinstance(loc_input, dict):
            lat = float(loc_input.get("latitude", loc_input.get("lat", fallback_lat)))
            lng = float(loc_input.get("longitude", loc_input.get("lon", fallback_lng)))
            name = loc_input.get("display_name") or loc_input.get("name") or fallback_name
            return {
                "display_name": name,
                "latitude": lat,
                "longitude": lng,
            }
        elif isinstance(loc_input, str):
            results = GeocodingService.geocode(loc_input, limit=1)
            if results:
                return results[0]
            return {
                "display_name": loc_input,
                "latitude": fallback_lat,
                "longitude": fallback_lng,
            }
        return {
            "display_name": fallback_name,
            "latitude": fallback_lat,
            "longitude": fallback_lng,
        }
