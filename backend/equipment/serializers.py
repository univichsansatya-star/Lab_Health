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

    def validate(self, attrs):
        total = attrs.get("total_quantity")
        available = attrs.get("available_quantity")
        borrowed = attrs.get("borrowed_quantity")
        maintenance = attrs.get("maintenance_quantity")

        if self.instance is not None:
            total = total if total is not None else self.instance.total_quantity
            available = available if available is not None else self.instance.available_quantity
            borrowed = borrowed if borrowed is not None else self.instance.borrowed_quantity
            maintenance = maintenance if maintenance is not None else self.instance.maintenance_quantity

        if total is not None and available is not None and borrowed is not None and maintenance is not None:
            if available < 0 or borrowed < 0 or maintenance < 0:
                raise serializers.ValidationError("Quantity counters must not be negative.")
            if available + borrowed + maintenance > total:
                raise serializers.ValidationError(
                    "Total (available + borrowed + maintenance) exceeds total_quantity."
                )
        return attrs