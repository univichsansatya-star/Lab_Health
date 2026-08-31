from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "target_role", "type", "is_read", "created_at")
    search_fields = ("title", "message", "user__name")
    list_filter = ("target_role", "type", "is_read")