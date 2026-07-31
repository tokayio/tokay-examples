from django.urls import path

from . import views

urlpatterns = [
    path("", views.directory, name="directory"),
    path("rooms/<slug:room_slug>/", views.room, name="room"),
    path("health", views.health, name="health"),
]
