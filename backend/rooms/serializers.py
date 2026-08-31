from rest_framework import serializers
from .models import LabRoom


class LabRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabRoom
        fields = ["id", "code", "name", "building", "floor", "capacity", "supervisor", "status", "active_class"]