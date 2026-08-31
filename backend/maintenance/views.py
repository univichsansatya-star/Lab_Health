from secrets import randbelow
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsStaffOrAdmin
from equipment.models import Equipment
from .models import MaintenanceRecord
from .serializers import MaintenanceRecordSerializer


def next_ticket_number():
    prefix = timezone.localdate().strftime("%Y%m")
    while True:
        candidate = f"MNT-{prefix}-{10 + randbelow(90):02d}"
        if not MaintenanceRecord.objects.filter(ticket_number=candidate).exists():
            return candidate


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.select_related("equipment").all()
    serializer_class = MaintenanceRecordSerializer
    http_method_names = ["get", "post", "head", "options"]
    filterset_fields = ["status", "priority", "equipment"]
    search_fields = ["ticket_number", "issue_description", "reported_by", "equipment__name", "equipment__code"]
    ordering = ["-reported_date"]

    def get_permissions(self):
        if self.action in {"create", "update_status"}:
            return [IsStaffOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        with transaction.atomic():
            equipment_id = serializer.validated_data["equipment"].pk
            equipment = Equipment.objects.select_for_update().get(pk=equipment_id)
            equipment.maintenance_quantity += 1
            equipment.available_quantity = max(0, equipment.available_quantity - 1)
            equipment.condition = Equipment.Condition.MAINTENANCE_REQUIRED
            equipment.save(update_fields=["maintenance_quantity", "available_quantity", "condition"])
            serializer.save(ticket_number=next_ticket_number())

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        if not request.user.is_staff_role:
            return Response({"detail": "Staff access required."}, status=403)
        record = self.get_object()
        new_status = request.data.get("status")
        if new_status not in dict(MaintenanceRecord.Status.choices):
            return Response({"status": ["A valid status is required."]}, status=400)
        with transaction.atomic():
            record = MaintenanceRecord.objects.select_for_update().select_related("equipment").get(pk=record.pk)
            was_completed = record.status == MaintenanceRecord.Status.COMPLETED
            record.status = new_status
            if "notes" in request.data:
                record.notes = request.data["notes"]
            if "cost" in request.data:
                record.cost = request.data["cost"]
            if new_status == MaintenanceRecord.Status.COMPLETED:
                record.completed_date = timezone.localdate()
            record.save()
            if new_status == MaintenanceRecord.Status.COMPLETED and not was_completed:
                equipment = Equipment.objects.select_for_update().get(pk=record.equipment_id)
                equipment.maintenance_quantity = max(0, equipment.maintenance_quantity - 1)
                equipment.available_quantity = min(equipment.total_quantity, equipment.available_quantity + 1)
                equipment.condition = Equipment.Condition.GOOD
                equipment.last_inspection_date = timezone.localdate()
                equipment.save(update_fields=["maintenance_quantity", "available_quantity", "condition", "last_inspection_date"])
        return Response(self.get_serializer(record).data)