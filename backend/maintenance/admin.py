from django.contrib import admin
from .models import MaintenanceRecord


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ("ticket_number", "equipment", "status", "priority", "reported_date", "completed_date")
    search_fields = ("ticket_number", "equipment__code", "equipment__name", "reported_by")
    list_filter = ("status", "priority", "reported_date")