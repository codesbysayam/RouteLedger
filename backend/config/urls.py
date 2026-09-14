"""
URL configuration for RouteLedger project.
"""

from django.contrib import admin
from django.urls import path, include
from trips.views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/", include("trips.urls")),
]
