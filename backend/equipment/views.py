from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from accounts.permissions import IsStaffOrAdmin
from .models import Equipment
from .serializers import EquipmentSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    filterset_fields = ["category", "condition", "location"]
    search_fields = ["code", "name", "brand", "model", "description", "location"]
    ordering_fields = ["name", "available_quantity", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [IsStaffOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        availability = self.request.query_params.get("availability")
        if availability == "available_only":
            queryset = queryset.filter(available_quantity__gt=0)
        elif availability == "low_stock":
            queryset = queryset.filter(available_quantity__lte=2)
        return queryset