"""
RouteLedger - Trip Models
Stores planned commercial trips, HOS calculations, and compliance verification status.
"""

from django.db import models
import uuid


class CommercialTrip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    origin_name = models.CharField(max_length=255)
    pickup_name = models.CharField(max_length=255)
    destination_name = models.CharField(max_length=255)
    total_distance_miles = models.FloatField(default=0.0)
    total_drive_hours = models.FloatField(default=0.0)
    total_duration_hours = models.FloatField(default=0.0)
    initial_cycle_used = models.FloatField(default=0.0)
    final_cycle_used = models.FloatField(default=0.0)
    is_compliant = models.BooleanField(default=True)
    compliance_status = models.CharField(max_length=50, default="COMPLIANT")
    plan_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Trip {self.id}: {self.origin_name} -> {self.destination_name} ({self.total_distance_miles} mi)"
