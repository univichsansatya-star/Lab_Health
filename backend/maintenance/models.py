import uuid
from django.db import models
from equipment.models import Equipment


def make_id():
    return str(uuid.uuid4())


class MaintenanceRecord(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        SCRAPPED = "SCRAPPED", "Scrapped"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    id = models.CharField(primary_key=True, max_length=64, default=make_id, editable=False)
    ticket_number = models.CharField(max_length=40, unique=True, blank=True)
    equipment = models.ForeignKey(Equipment, on_delete=models.PROTECT, related_name="maintenance_records")
    issue_description = models.TextField()
    reported_by = models.CharField(max_length=255)
    reported_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    technician = models.CharField(max_length=255, blank=True, default="")
    cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, default="")
    completed_date = models.DateField(blank=True, null=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)

    def __str__(self):
        return self.ticket_number or str(self.id)