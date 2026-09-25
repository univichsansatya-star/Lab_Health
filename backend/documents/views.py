from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet

from accounts.permissions import IsStaffOrAdmin
from .models import LabDocument
from .serializers import LabDocumentSerializer


class LabDocumentViewSet(ReadOnlyModelViewSet):
    queryset = LabDocument.objects.all()
    serializer_class = LabDocumentSerializer
    search_fields = ["title", "file_name", "description"]
    ordering_fields = ["title", "created_at"]
    ordering = ["title"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [IsStaffOrAdmin()]