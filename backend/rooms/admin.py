from django.contrib import admin
from .models import LabRoom


@admin.register(LabRoom)
class LabRoomAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "building", "floor", "capacity", "status", "supervisor")
    search_fields = ("code", "name", "building", "supervisor")
    list_filter = ("status", "building")