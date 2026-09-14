"""
URL routing for trips application.
"""

from django.urls import path
from .views import (
    GeocodeView,
    RouteView,
    TripPlanView,
    TripDetailView,
    TripListView,
)

urlpatterns = [
    path("geocode/", GeocodeView.as_view(), name="geocode"),
    path("route/", RouteView.as_view(), name="route"),
    path("trips/plan/", TripPlanView.as_view(), name="trip-plan"),
    path("trips/<uuid:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("trips/", TripListView.as_view(), name="trip-list"),
]
