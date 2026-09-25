import uuid

from django.db import models


def make_id():
    return str(uuid.uuid4())


class LabDocument(models.Model):
    class DocumentType(models.TextChoices):
        SOP = "SOP", "SOP (Standar Operasional Prosedur)"
        GENERAL = "GENERAL", "General"

    id = models.CharField(primary_key=True, max_length=64, default=make_id, editable=False)
    title = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255, blank=True, default="")
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.SOP)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title