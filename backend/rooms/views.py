from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import LabRoom
from .serializers import LabRoomSerializer


class LabRoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LabRoom.objects.all().order_by("code")
    serializer_class = LabRoomSerializer
    permission_classes = [IsAuthenticated]