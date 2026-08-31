import uuid
from django.db import models


def make_id():
    return str(uuid.uuid4())


class Equipment(models.Model):
    class Category(models.TextChoices):
        NURSING = "Nursing Skills", "Nursing Skills"
        MATERNITY = "Maternity & Child Health", "Maternity & Child Health"
        EMERGENCY = "Emergency & Critical Care", "Emergency & Critical Care"
        ANATOMY = "Anatomy & Physiology", "Anatomy & Physiology"
        DIAGNOSTIC = "Diagnostic & Vital Signs", "Diagnostic & Vital Signs"
        SURGICAL = "Surgical & Sterile Instruments", "Surgical & Sterile Instruments"
        PHARMA = "Pharmacology & Labware", "Pharmacology & Labware"

    class Condition(models.TextChoices):
        EXCELLENT = "EXCELLENT", "Excellent"
        GOOD = "GOOD", "Good"
        FAIR = "FAIR", "Fair"
        MAINTENANCE_REQUIRED = "MAINTENANCE_REQUIRED", "Maintenance Required"
        DAMAGED = "DAMAGED", "Damaged"

    id = models.CharField(primary_key=True, max_length=64, default=make_id, editable=False)
    code = models.CharField(max_length=80, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=80, choices=Category.choices)
    brand = models.CharField(max_length=255)
    model = models.CharField(max_length=255)
    description = models.TextField()
    total_quantity = models.PositiveIntegerField()
    available_quantity = models.PositiveIntegerField()
    borrowed_quantity = models.PositiveIntegerField(default=0)
    maintenance_quantity = models.PositiveIntegerField(default=0)
    condition = models.CharField(max_length=30, choices=Condition.choices)
    location = models.CharField(max_length=255)
    image_url = models.URLField(blank=True, default="")
    specifications = models.JSONField(default=list)
    usage_guidelines = models.JSONField(default=list)
    is_consumable = models.BooleanField(default=False)
    requires_special_approval = models.BooleanField(default=False)
    qr_code = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    last_inspection_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.code} - {self.name}"