from rest_framework import serializers

from .models import LabDocument


class LabDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabDocument
        fields = [
            "id",
            "title",
            "file_name",
            "document_type",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]