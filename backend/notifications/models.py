import uuid
from django.conf import settings
from django.db import models


def make_id():
    return str(uuid.uuid4())


class Notification(models.Model):
    class TargetRole(models.TextChoices):
        STUDENT = "student", "Student"
        NURSE_STAFF = "nurse_staff", "Nurse Staff"
        ADMIN = "admin", "Admin"
        ALL = "all", "All"

    class NotificationType(models.TextChoices):
        REQUEST_STATUS = "request_status", "Request Status"
        DUE_REMINDER = "due_reminder", "Due Reminder"
        OVERDUE = "overdue", "Overdue"
        MAINTENANCE = "maintenance", "Maintenance"
        GENERAL = "general", "General"

    id = models.CharField(primary_key=True, max_length=64, default=make_id, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="notifications")
    target_role = models.CharField(max_length=20, choices=TargetRole.choices, blank=True, null=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=255, blank=True, default="")

    def __str__(self):
        return self.title