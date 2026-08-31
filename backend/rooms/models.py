import uuid
from django.db import models


def make_id():
    return str(uuid.uuid4())


class LabRoom(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        IN_USE = "IN_USE", "In Use"
        MAINTENANCE = "MAINTENANCE", "Maintenance"

    id = models.CharField(primary_key=True, max_length=64, default=make_id, editable=False)
    code = models.CharField(max_length=80, unique=True)
    name = models.CharField(max_length=255)
    building = models.CharField(max_length=255)
    floor = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField()
    supervisor = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices)
    active_class = models.CharField(max_length=255, blank=True, default="")

    def __str__(self):
        return f"{self.code} - {self.name}"