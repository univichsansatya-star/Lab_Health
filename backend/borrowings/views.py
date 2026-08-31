from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsStaffOrAdmin
from notifications.models import Notification
from equipment.models import Equipment
from .models import BorrowingRequest
from .serializers import BorrowingRequestSerializer, BorrowingStatusSerializer


class BorrowingRequestViewSet(viewsets.ModelViewSet):
    serializer_class = BorrowingRequestSerializer
    http_method_names = ["get", "post", "head", "options"]
    filterset_fields = ["status", "user"]
    search_fields = ["ticket_number", "purpose", "user__name", "user__nim_nip"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action == "update_status":
            return [IsStaffOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = BorrowingRequest.objects.select_related("user").prefetch_related("items__equipment")
        if self.request.user.is_staff_role:
            return queryset
        return queryset.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.role != "student":
            return Response({"detail": "Only students can create borrowing requests."}, status=403)
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        serializer = BorrowingStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        with transaction.atomic():
            borrowing = BorrowingRequest.objects.select_for_update().prefetch_related("items__equipment").get(pk=pk)
            previous_status = borrowing.status
            new_status = values.pop("status")
            for field, value in values.items():
                setattr(borrowing, field, value)
            borrowing.status = new_status
            borrowing.save()

            terminal_statuses = {
                BorrowingRequest.Status.RETURNED,
                BorrowingRequest.Status.REJECTED,
                BorrowingRequest.Status.CANCELLED,
            }
            if new_status in terminal_statuses and previous_status not in terminal_statuses:
                for item in borrowing.items.all():
                    equipment = Equipment.objects.select_for_update().get(pk=item.equipment_id)
                    equipment.available_quantity = min(
                        equipment.total_quantity, equipment.available_quantity + item.quantity
                    )
                    equipment.borrowed_quantity = max(0, equipment.borrowed_quantity - item.quantity)
                    equipment.save(update_fields=["available_quantity", "borrowed_quantity"])

            Notification.objects.create(
                user=borrowing.user,
                title=f"Status Peminjaman: {new_status}",
                message=f"Tiket {borrowing.ticket_number} sekarang berstatus: {new_status}.",
                type=(
                    Notification.NotificationType.OVERDUE
                    if new_status == BorrowingRequest.Status.OVERDUE
                    else Notification.NotificationType.REQUEST_STATUS
                ),
                link=f"/student/borrowings/{borrowing.id}",
            )
        return Response(self.get_serializer(borrowing).data)