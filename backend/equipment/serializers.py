from rest_framework import serializers
from .models import Equipment


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = [
            "id", "code", "name", "category", "brand", "model", "description",
            "total_quantity", "available_quantity", "borrowed_quantity",
            "maintenance_quantity", "condition", "location", "image_url",
            "specifications", "usage_guidelines", "is_consumable",
            "requires_special_approval", "qr_code", "created_at",
            "last_inspection_date",
        ]
        read_only_fields = ["id", "created_at"]