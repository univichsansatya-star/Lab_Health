from django.contrib import admin

from .models import LabDocument


@admin.register(LabDocument)
class LabDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "file_name", "document_type", "created_at")
    search_fields = ("title", "file_name", "description")
    list_filter = ("document_type",)