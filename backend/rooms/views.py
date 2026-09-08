from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import LabRoom
from .serializers import LabRoomSerializer


class LabRoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LabRoom.objects.all().order_by("code")
    serializer_class = LabRoomSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return super().get_permissions()