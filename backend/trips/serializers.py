"""
RouteLedger - DRF Serializers
Validates API payloads for geocoding, routing, and HOS trip planning.
"""

from rest_framework import serializers
from .models import CommercialTrip


class GeocodeRequestSerializer(serializers.Serializer):
    query = serializers.CharField(required=True, min_length=1, max_length=255)
    limit = serializers.IntegerField(required=False, default=5, min_value=1, max_value=10)


class RouteRequestSerializer(serializers.Serializer):
    waypoints = serializers.ListField(
        child=serializers.ListField(child=serializers.FloatField(), min_length=2, max_length=2),
        min_length=2,
        required=True,
    )
    overview = serializers.CharField(required=False, default="full")
    steps = serializers.BooleanField(required=False, default=True)


class CarrierInfoSerializer(serializers.Serializer):
    carrier_name = serializers.CharField(required=False, allow_blank=True, default="Apex Freight Systems LLC")
    main_office = serializers.CharField(required=False, allow_blank=True, default="4200 Logistics Blvd, Richmond, VA 23230")
    home_terminal = serializers.CharField(required=False, allow_blank=True, default="Richmond Terminal, VA")
    driver_name = serializers.CharField(required=False, allow_blank=True, default="John R. Miller")
    vehicle_number = serializers.CharField(required=False, allow_blank=True, default="TRK-4089")
    trailer_number = serializers.CharField(required=False, allow_blank=True, default="TLR-8821")
    shipping_doc = serializers.CharField(required=False, allow_blank=True, default="BOL-77341 / Freight")
    co_driver = serializers.CharField(required=False, allow_blank=True, default="Solo Driver")


class SettingsSerializer(serializers.Serializer):
    pickup_duration_hours = serializers.FloatField(required=False, default=1.0, min_value=0.25, max_value=8.0)
    dropoff_duration_hours = serializers.FloatField(required=False, default=1.0, min_value=0.25, max_value=8.0)
    fuel_interval_miles = serializers.FloatField(required=False, default=1000.0, min_value=100.0, max_value=2000.0)
    fuel_duration_hours = serializers.FloatField(required=False, default=0.5, min_value=0.25, max_value=2.0)
    break_duration_hours = serializers.FloatField(required=False, default=0.5, min_value=0.5, max_value=2.0)
    daily_driving_limit_hours = serializers.FloatField(required=False, default=11.0, min_value=5.0, max_value=11.0)
    daily_duty_window_hours = serializers.FloatField(required=False, default=14.0, min_value=8.0, max_value=14.0)
    cycle_limit_hours = serializers.FloatField(required=False, default=70.0, min_value=10.0, max_value=70.0)
    qualifying_rest_hours = serializers.FloatField(required=False, default=10.0, min_value=8.0, max_value=16.0)
    restart_duration_hours = serializers.FloatField(required=False, default=34.0, min_value=24.0, max_value=48.0)
    allow_sleeper_berth = serializers.BooleanField(required=False, default=False)


class TripPlanRequestSerializer(serializers.Serializer):
    origin = serializers.CharField(required=True, min_length=1)
    pickup = serializers.CharField(required=False, allow_blank=True)
    destination = serializers.CharField(required=True, min_length=1)
    current_cycle_used = serializers.FloatField(required=True, min_value=0.0, max_value=70.0)
    departure_time = serializers.CharField(required=False, allow_blank=True)
    carrier_info = CarrierInfoSerializer(required=False, default=dict)
    settings = SettingsSerializer(required=False, default=dict)

    def validate_current_cycle_used(self, value):
        if value < 0.0 or value > 70.0:
            raise serializers.ValidationError("Current cycle hours must be between 0.0 and 70.0 hours.")
        return value


class CommercialTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommercialTrip
        fields = "__all__"
