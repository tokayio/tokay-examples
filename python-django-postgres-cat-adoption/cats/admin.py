from django.contrib import admin

from .models import Cat


@admin.register(Cat)
class CatAdmin(admin.ModelAdmin):
    list_display = ["name", "age", "room", "status"]
    list_filter = ["room", "status"]
    search_fields = ["name", "temperament", "note"]
