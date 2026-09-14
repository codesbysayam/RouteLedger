"""
RouteLedger - DRF Views
Handles API endpoints for health, geocoding, road routing, trip planning, and saved trip retrieval.
"""

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    GeocodeRequestSerializer,
    RouteRequestSerializer,
    TripPlanRequestSerializer,
    CommercialTripSerializer,
)
from .models import CommercialTrip
from .services import GeocodingService, RoutingService, TripService

logger = logging.getLogger(__name__)


def success_response(data: any, status_code: int = status.HTTP_200_OK) -> Response:
    return Response({"success": True, "data": data, "error": None}, status=status_code)


def error_response(code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST) -> Response:
    return Response(
        {"success": False, "data": None, "error": {"code": code, "message": message}},
        status=status_code,
    )


class HealthCheckView(APIView):
    def get(self, request):
        return success_response({"status": "ok", "service": "RouteLedger HOS Compliance API"})


class GeocodeView(APIView):
    def post(self, request):
        serializer = GeocodeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("INVALID_INPUT", str(serializer.errors))

        query = serializer.validated_data["query"]
        limit = serializer.validated_data.get("limit", 5)

        try:
            results = GeocodingService.geocode(query=query, limit=limit)
            return success_response(results)
        except Exception as e:
            logger.error("Geocoding failed for query '%s': %s", query, str(e))
            return error_response("GEOCODE_ERROR", "Failed to resolve location coordinates.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class RouteView(APIView):
    def post(self, request):
        serializer = RouteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("INVALID_INPUT", str(serializer.errors))

        waypoints_raw = serializer.validated_data["waypoints"]
        overview = serializer.validated_data.get("overview", "full")
        steps = serializer.validated_data.get("steps", True)

        try:
            waypoints = [(pt[0], pt[1]) for pt in waypoints_raw]
            route_data = RoutingService.get_route(waypoints=waypoints, overview=overview, steps=steps)
            return success_response(route_data)
        except Exception as e:
            logger.error("Routing error: %s", str(e))
            return error_response("ROUTE_ERROR", "Failed to calculate road driving route.", status.HTTP_500_INTERNAL_SERVER_ERROR)


class TripPlanView(APIView):
    def post(self, request):
        serializer = TripPlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = next(iter(serializer.errors.values()))[0] if serializer.errors else "Invalid inputs"
            return error_response("VALIDATION_ERROR", str(first_err))

        try:
            trip_plan = TripService.plan_commercial_trip(serializer.validated_data)

            # Persist to database if available
            try:
                trip_obj = CommercialTrip.objects.create(
                    origin_name=trip_plan["origin"]["display_name"],
                    pickup_name=trip_plan["pickup"]["display_name"],
                    destination_name=trip_plan["destination"]["display_name"],
                    total_distance_miles=trip_plan["total_distance_miles"],
                    total_drive_hours=trip_plan["total_drive_hours"],
                    total_duration_hours=trip_plan["estimated_total_duration_hours"],
                    initial_cycle_used=trip_plan["initial_cycle_used"],
                    final_cycle_used=trip_plan["final_cycle_used"],
                    is_compliant=trip_plan["is_compliant"],
                    compliance_status=trip_plan["compliance_status"],
                    plan_data=trip_plan,
                )
                trip_plan["saved_db_id"] = str(trip_obj.id)
            except Exception as db_err:
                logger.warning("Database write skipped: %s", str(db_err))

            return success_response(trip_plan, status_code=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("Trip planning execution failed: %s", str(e))
            return error_response("PLANNING_FAILURE", f"Trip planning failed: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)


class TripDetailView(APIView):
    def get(self, request, pk):
        try:
            trip = CommercialTrip.objects.get(pk=pk)
            serializer = CommercialTripSerializer(trip)
            return success_response(serializer.data)
        except CommercialTrip.DoesNotExist:
            return error_response("NOT_FOUND", f"Trip '{pk}' does not exist.", status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return error_response("SERVER_ERROR", str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)


class TripListView(APIView):
    def get(self, request):
        try:
            trips = CommercialTrip.objects.all()[:20]
            serializer = CommercialTripSerializer(trips, many=True)
            return success_response(serializer.data)
        except Exception as e:
            return error_response("SERVER_ERROR", str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
