from django.db.models import Q
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            Q(user=user) | Q(user__isnull=True, target_role__in=[user.role, Notification.TargetRole.ALL])
        ).order_by("-created_at")


class NotificationReadView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def post(self, request, pk):
        notification = Notification.objects.filter(pk=pk).filter(
            Q(user=request.user) | Q(user__isnull=True, target_role__in=[request.user.role, "all"])
        ).first()
        if not notification:
            return Response({"detail": "Notification not found."}, status=404)
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)


class NotificationReadAllView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        queryset = Notification.objects.filter(
            Q(user=request.user) | Q(user__isnull=True, target_role__in=[request.user.role, "all"])
        )
        queryset.update(is_read=True)
        return Response({"updated": queryset.count()})