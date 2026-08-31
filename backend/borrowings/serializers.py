from django.utils.dateparse import parse_datetime
from rest_framework import serializers

from equipment.models import Equipment
from .models import BorrowingItem, BorrowingRequest


class BorrowingItemSerializer(serializers.ModelSerializer):
    equipment_id = serializers.PrimaryKeyRelatedField(
        source="equipment", queryset=Equipment.objects.all()
    )
    equipment_code = serializers.SerializerMethodField()
    equipment_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = BorrowingItem
        fields = [
            "equipment_id", "equipment_code", "equipment_name", "quantity",
            "image_url", "location", "condition_at_borrow", "condition_at_return",
            "return_notes",
        ]
        extra_kwargs = {"quantity": {"min_value": 1}}

    def get_equipment_code(self, obj):
        return obj.equipment.code

    def get_equipment_name(self, obj):
        return obj.equipment.name

    def get_image_url(self, obj):
        return obj.equipment.image_url

    def get_location(self, obj):
        return obj.equipment.location


class BorrowingRequestSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source="user.id", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_nim = serializers.CharField(source="user.nim_nip", read_only=True)
    user_department = serializers.CharField(source="user.department", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)
    items = BorrowingItemSerializer(many=True)

    class Meta:
        model = BorrowingRequest
        fields = [
            "id", "ticket_number", "user_id", "user_name", "user_nim",
            "user_department", "user_phone", "user_role", "purpose", "course_name",
            "supervisor_lecturer", "borrow_date", "expected_return_date",
            "actual_return_date", "status", "items", "rejection_reason",
            "admin_notes", "handover_staff_name", "return_staff_name",
            "signature_student", "signature_staff", "fine_amount", "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "ticket_number", "user_id", "user_name", "user_nim", "user_department", "user_phone", "user_role", "status", "created_at", "updated_at"]

    def create(self, validated_data):
        from django.db import transaction
        from django.utils import timezone
        from notifications.models import Notification
        from .services import next_ticket_number

        items_data = validated_data.pop("items")
        user = self.context["request"].user
        with transaction.atomic():
            request = BorrowingRequest.objects.create(
                user=user,
                ticket_number=next_ticket_number(),
                status=BorrowingRequest.Status.PENDING,
                **validated_data,
            )
            for item_data in items_data:
                equipment = item_data["equipment"]
                quantity = item_data["quantity"]
                equipment = Equipment.objects.select_for_update().get(pk=equipment.pk)
                equipment.available_quantity = max(0, equipment.available_quantity - quantity)
                equipment.borrowed_quantity += quantity
                equipment.save(update_fields=["available_quantity", "borrowed_quantity"])
                BorrowingItem.objects.create(request=request, equipment=equipment, **{
                    key: value for key, value in item_data.items() if key != "equipment"
                })
            Notification.objects.create(
                target_role=Notification.TargetRole.NURSE_STAFF,
                title="Permohonan Peminjaman Masuk",
                message=f"{user.name} mengajukan peminjaman ({request.ticket_number}) untuk {request.purpose}.",
                type=Notification.NotificationType.REQUEST_STATUS,
                link="/staff/requests",
            )
        return request


class BorrowingStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=BorrowingRequest.Status.choices)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    handover_staff_name = serializers.CharField(required=False, allow_blank=True)
    return_staff_name = serializers.CharField(required=False, allow_blank=True)
    fine_amount = serializers.DecimalField(required=False, allow_null=True, max_digits=12, decimal_places=2)
    actual_return_date = serializers.DateTimeField(required=False, allow_null=True)