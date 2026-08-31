from rest_framework import serializers
from .models import MaintenanceRecord


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    equipment_id = serializers.PrimaryKeyRelatedField(
        source="equipment", queryset=MaintenanceRecord._meta.get_field("equipment").remote_field.model.objects.all()
    )
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)
    equipment_code = serializers.CharField(source="equipment.code", read_only=True)
    location = serializers.CharField(source="equipment.location", read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            "id", "ticket_number", "equipment_id", "equipment_name", "equipment_code",
            "location", "issue_description", "reported_by", "reported_date", "status",
            "technician", "cost", "notes", "completed_date", "priority",
        ]
        read_only_fields = ["id", "ticket_number", "reported_date", "equipment_name", "equipment_code", "location"]