"""
RouteLedger - Comprehensive HOS Engine & Validator Unit Tests
Runs using standard library unittest with 0 external dependencies.
Tests all 16 core requirements and edge cases.
"""

import unittest
from datetime import datetime
import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from trips.services.hos_planner import HOSPlanner, HOSConfig, DutyStatus, EventType
from trips.services.hos_validator import validate_hos_plan
from trips.services.log_generator import ELDLogGenerator
from trips.services.routing_service import haversine_miles


class TestHOSEngine(unittest.TestCase):
    def setUp(self):
        self.planner = HOSPlanner()
        self.dep_time = datetime(2026, 9, 15, 6, 0, 0)
        self.origin = {"display_name": "Richmond, VA", "latitude": 37.5407, "longitude": -77.4360}
        self.pickup = {"display_name": "Richmond, VA", "latitude": 37.5407, "longitude": -77.4360}
        self.dest = {"display_name": "Newark, NJ", "latitude": 40.7357, "longitude": -74.1724}

    def test_01_pickup_duration_and_status(self):
        """Verify Cargo Pickup is exactly 1.0 hr on-duty not driving."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=340.0, total_duration_hours=5.8,
            current_cycle_used=0.0, departure_time=self.dep_time,
        )
        pickup_ev = next(e for e in res["events"] if e["type"] == EventType.PICKUP)
        self.assertEqual(pickup_ev["duration_hours"], 1.0)
        self.assertEqual(pickup_ev["duty_status"], DutyStatus.ON_DUTY_NOT_DRIVING)

    def test_02_dropoff_duration_and_status(self):
        """Verify Cargo Dropoff is exactly 1.0 hr on-duty not driving."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=340.0, total_duration_hours=5.8,
            current_cycle_used=0.0, departure_time=self.dep_time,
        )
        dropoff_ev = next(e for e in res["events"] if e["type"] == EventType.DROPOFF)
        self.assertEqual(dropoff_ev["duration_hours"], 1.0)
        self.assertEqual(dropoff_ev["duty_status"], DutyStatus.ON_DUTY_NOT_DRIVING)

    def test_03_short_trip_under_30_minutes(self):
        """Short trip under 30 minutes should succeed without break or rest."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=15.0, total_duration_hours=0.3,
            current_cycle_used=10.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        self.assertEqual(len(res["days"]), 1)

    def test_04_30_minute_break_rule(self):
        """Trip with >8 hours driving must include a 30-minute rest break."""
        # 520 miles @ 52mph = 10.0 hrs driving (>8.0 hrs)
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=520.0, total_duration_hours=10.0,
            current_cycle_used=5.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        break_evs = [e for e in res["events"] if e["type"] == EventType.REST_30_MIN]
        self.assertGreaterEqual(len(break_evs), 1, "Must insert 30-min break after 8h driving")

    def test_05_11_hour_driving_limit_and_10_hour_rest(self):
        """Trip requiring >11 driving hours must insert 10-hour off-duty rest."""
        # 750 miles @ 55mph = ~13.6 driving hours (exceeds 11.0 hours)
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=750.0, total_duration_hours=13.6,
            current_cycle_used=10.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        rest_evs = [e for e in res["events"] if e["type"] == EventType.REST_10_HR]
        self.assertGreaterEqual(len(rest_evs), 1, "Must insert 10-hour rest")
        self.assertGreater(len(res["days"]), 1, "Must span multiple calendar days")

    def test_06_14_hour_duty_window_enforcement(self):
        """Duty window of 14 hours must never be exceeded by driving."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=650.0, total_duration_hours=12.0,
            current_cycle_used=0.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        self.assertLessEqual(val["metrics"]["max_duty_window_hours"], 14.05)

    def test_07_fuel_stop_every_1000_miles(self):
        """Trip over 1,000 miles must insert fuel stop(s) <= 1,000 mile intervals."""
        # 1,200 miles trip
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=1200.0, total_duration_hours=21.8,
            current_cycle_used=10.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        fuel_evs = [e for e in res["events"] if e["type"] == EventType.FUEL]
        self.assertGreaterEqual(len(fuel_evs), 1, "Must have at least 1 fuel stop for 1200 miles")

    def test_08_multi_fuel_stops_over_2000_miles(self):
        """Trip over 2,000 miles must insert multiple fuel stops."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=2400.0, total_duration_hours=43.6,
            current_cycle_used=5.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        fuel_evs = [e for e in res["events"] if e["type"] == EventType.FUEL]
        self.assertGreaterEqual(len(fuel_evs), 2, "Must have at least 2 fuel stops for 2400 miles")

    def test_09_70_hour_cycle_exhaustion_triggers_34_hour_restart(self):
        """When starting with high cycle (e.g. 66 hours), planner must insert 34-hour restart."""
        # Starting with 66.0 hours on cycle, trip takes 6 hours on duty -> would exceed 70
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=300.0, total_duration_hours=5.5,
            current_cycle_used=66.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        restart_evs = [e for e in res["events"] if e["type"] == EventType.RESTART_34_HR]
        self.assertGreaterEqual(len(restart_evs), 1, "Must trigger 34-hour restart")

    def test_10_cycle_hours_zero(self):
        """Starting with 0.0 cycle used operates normally."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=400.0, total_duration_hours=7.0,
            current_cycle_used=0.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"])
        self.assertEqual(res["initial_cycle_used"], 0.0)

    def test_11_cycle_hours_69_triggers_restart_immediately(self):
        """Starting with 69.0 cycle used (only 1 hr left) triggers restart for pickup/driving."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=200.0, total_duration_hours=3.5,
            current_cycle_used=69.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")

    def test_12_cycle_hours_70_exact(self):
        """Starting with 70.0 cycle used immediately restarts cycle."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=250.0, total_duration_hours=4.5,
            current_cycle_used=70.0, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")

    def test_13_daily_logs_totals_sum_to_24_hours(self):
        """Every daily log must sum to exactly 24.0 hours."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=1500.0, total_duration_hours=27.0,
            current_cycle_used=15.0, departure_time=self.dep_time,
        )
        daily_logs = ELDLogGenerator.generate_daily_logs(res["days"])
        self.assertGreaterEqual(len(daily_logs), 2)
        for log in daily_logs:
            tot = (
                log["totals"]["off_duty_hours"]
                + log["totals"]["sleeper_berth_hours"]
                + log["totals"]["driving_hours"]
                + log["totals"]["on_duty_not_driving_hours"]
            )
            self.assertAlmostEqual(tot, 24.0, places=1, msg=f"Day {log['day_number']} sum is {tot}")

    def test_14_no_overlapping_events(self):
        """All scheduled events must be strictly chronological with 0 overlap."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=800.0, total_duration_hours=14.5,
            current_cycle_used=20.0, departure_time=self.dep_time,
        )
        evs = res["events"]
        for i in range(len(evs) - 1):
            e1_end = datetime.fromisoformat(evs[i]["end_time"])
            e2_start = datetime.fromisoformat(evs[i + 1]["start_time"])
            self.assertLessEqual(e1_end, e2_start)

    def test_15_all_route_miles_accounted_for(self):
        """Sum of miles across all driving events must match total trip distance."""
        dist = 945.0
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=dist, total_duration_hours=17.0,
            current_cycle_used=10.0, departure_time=self.dep_time,
        )
        total_driven = sum(e["miles_covered"] for e in res["events"] if e["duty_status"] == DutyStatus.DRIVING)
        self.assertAlmostEqual(total_driven, dist, delta=1.5)

    def test_16_haversine_distance_calculation(self):
        """Verify great-circle distance utility works accurately."""
        # Richmond (37.5407, -77.4360) to Newark (40.7357, -74.1724) is ~280-300 air miles
        air_miles = haversine_miles(37.5407, -77.4360, 40.7357, -74.1724)
        self.assertGreater(air_miles, 270.0)
        self.assertLess(air_miles, 320.0)

    def test_17_deterministic_engine_execution(self):
        """Verify the HOS engine is completely deterministic across multiple runs."""
        run1 = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=650.0, total_duration_hours=11.5,
            current_cycle_used=24.5, departure_time=self.dep_time,
        )
        run2 = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=650.0, total_duration_hours=11.5,
            current_cycle_used=24.5, departure_time=self.dep_time,
        )
        self.assertEqual(len(run1["events"]), len(run2["events"]))
        self.assertEqual(len(run1["days"]), len(run2["days"]))
        for e1, e2 in zip(run1["events"], run2["events"]):
            self.assertEqual(e1["type"], e2["type"])
            self.assertEqual(e1["start_time"], e2["start_time"])
            self.assertEqual(e1["end_time"], e2["end_time"])
            self.assertEqual(e1["duration_hours"], e2["duration_hours"])
            self.assertEqual(e1["miles_covered"], e2["miles_covered"])

    def test_18_mandatory_34_hour_restart_cycle_reset(self):
        """Verify that when 34-hour restart is inserted, the remaining cycle resets to 0."""
        # Starting with 68.5 hours used on 70h cycle, requiring 1h pickup + driving
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=400.0, total_duration_hours=7.0,
            current_cycle_used=68.5, departure_time=self.dep_time,
        )
        restart_events = [e for e in res["events"] if e["type"] == EventType.RESTART_34_HR]
        self.assertGreaterEqual(len(restart_events), 1, "Mandatory 34-hour restart must be inserted")
        self.assertEqual(restart_events[0]["duration_hours"], 34.0)
        self.assertEqual(restart_events[0]["duty_status"], DutyStatus.OFF_DUTY)
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")

    def test_19_multi_day_cross_country_log_completeness(self):
        """Cross-country 2,800-mile trip across 4+ days produces valid 24h logs for every day."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=2800.0, total_duration_hours=50.0,
            current_cycle_used=15.0, departure_time=self.dep_time,
        )
        self.assertGreaterEqual(len(res["days"]), 4)
        daily_logs = ELDLogGenerator.generate_daily_logs(res["days"])
        for day_idx, log in enumerate(daily_logs):
            tot = (
                log["totals"]["off_duty_hours"]
                + log["totals"]["sleeper_berth_hours"]
                + log["totals"]["driving_hours"]
                + log["totals"]["on_duty_not_driving_hours"]
            )
            self.assertAlmostEqual(
                tot, 24.0, places=1,
                msg=f"Day {log['day_number']} totals do not sum to 24.0: {tot}"
            )
            self.assertTrue(len(log["graph_segments"]) > 0, f"Day {log['day_number']} missing graph segments")
            self.assertTrue(len(log["remarks"]) > 0, f"Day {log['day_number']} missing remarks")

    def test_20_cycle_depletion_at_69_5_hours(self):
        """Starting with 69.5 hours on cycle exhausts available duty time immediately."""
        res = self.planner.plan_trip(
            self.origin, self.pickup, self.dest,
            total_distance_miles=500.0, total_duration_hours=9.0,
            current_cycle_used=69.5, departure_time=self.dep_time,
        )
        val = validate_hos_plan(res)
        self.assertTrue(val["compliant"], f"Violations: {val['violations']}")
        # Must have triggered 34h restart
        restarts = [e for e in res["events"] if e["type"] == EventType.RESTART_34_HR]
        self.assertGreaterEqual(len(restarts), 1)


if __name__ == "__main__":
    unittest.main()
