"""
RouteLedger - ELD/RODS Daily Log Generator
Produces FMCSA 49 CFR § 395.8 compliant Driver's Daily Log data structures.
Splits multi-day journeys into individual 24-hour log sheets with exact status segments, totals, and remarks.
"""

from typing import List, Dict, Any, Optional


class ELDLogGenerator:
    @staticmethod
    def generate_daily_logs(
        days: List[Dict[str, Any]],
        carrier_info: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Takes day-by-day schedules from HOSPlanner and attaches carrier, vehicle,
        shipping, and driver certification metadata conforming to FMCSA RODS layout.
        """
        info = carrier_info or {}
        carrier_name = info.get("carrier_name", "Apex Freight Systems LLC")
        main_office = info.get("main_office", "4200 Logistics Blvd, Richmond, VA 23230")
        home_terminal = info.get("home_terminal", "Richmond Terminal, VA")
        driver_name = info.get("driver_name", "John R. Miller")
        vehicle_num = info.get("vehicle_number", "TRK-4089")
        trailer_num = info.get("trailer_number", "TLR-8821")
        shipping_doc = info.get("shipping_doc", "BOL-77341 / Consumer Goods")
        co_driver = info.get("co_driver", "N/A - Solo Driver")

        daily_logs: List[Dict[str, Any]] = []

        for d in days:
            events = d.get("events", [])
            remarks = d.get("remarks", [])

            # Generate SVG-ready time segments for the 24-hour graph
            # 00:00 is x=0%, 24:00 is x=100%
            graph_segments = []
            for ev in events:
                start_iso = ev["start_time"]
                end_iso = ev["end_time"]

                # Extract hour & minute
                # ISO: YYYY-MM-DDTHH:MM:SS...
                t_start = start_iso.split("T")[1][:5]
                t_end = end_iso.split("T")[1][:5]

                h_s, m_s = map(int, t_start.split(":"))
                h_e, m_e = map(int, t_end.split(":"))

                start_fraction = (h_s + m_s / 60.0) / 24.0
                end_fraction = (h_e + m_e / 60.0) / 24.0
                # Handle midnight wrap (24:00)
                if end_fraction == 0.0 and (h_e != h_s or m_e != m_s):
                    end_fraction = 1.0

                graph_segments.append({
                    "event_id": ev.get("id"),
                    "duty_status": ev["duty_status"],
                    "start_time": t_start,
                    "end_time": t_end,
                    "start_fraction": round(start_fraction, 4),
                    "end_fraction": round(end_fraction, 4),
                    "duration_hours": ev["duration_hours"],
                    "location_name": ev.get("location_name", ""),
                    "description": ev.get("description", ""),
                })

            daily_logs.append({
                "day_number": d["day_number"],
                "date": d["date"],
                "carrier_name": carrier_name,
                "main_office_address": main_office,
                "home_terminal_address": home_terminal,
                "driver_name": driver_name,
                "co_driver": co_driver,
                "truck_tractor_number": vehicle_num,
                "trailer_number": trailer_num,
                "shipping_documents": shipping_doc,
                "total_miles_driving_today": d.get("total_miles_driving_today", 0.0),
                "total_hours": d.get("total_hours", 24.0),
                "totals": {
                    "off_duty_hours": d.get("off_duty_hours", 0.0),
                    "sleeper_berth_hours": d.get("sleeper_berth_hours", 0.0),
                    "driving_hours": d.get("driving_hours", 0.0),
                    "on_duty_not_driving_hours": d.get("on_duty_not_driving_hours", 0.0),
                    "total_on_duty_hours": d.get("total_on_duty_hours", 0.0),
                },
                "graph_segments": graph_segments,
                "remarks": remarks,
                "certified": True,
                "certification_statement": (
                    f"I hereby certify that my data entries and my record of duty status "
                    f"for {d['date']} are true and correct. — {driver_name}"
                ),
            })

        return daily_logs
