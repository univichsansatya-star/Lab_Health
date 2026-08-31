from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source="user.id", read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = ["id", "user_id", "target_role", "title", "message", "type", "is_read", "created_at", "link"]
        read_only_fields = ["id", "user_id", "created_at"]