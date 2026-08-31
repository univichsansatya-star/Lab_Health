from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "name", "nim_nip", "email", "role", "department",
            "study_program", "semester", "phone", "avatar", "status", "joined_date",
        ]
        read_only_fields = ["id", "joined_date"]


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "name", "nim_nip", "email", "password", "role", "department",
            "study_program", "semester", "phone", "avatar",
        ]

    def validate_role(self, value):
        if value != User.Role.STUDENT:
            raise serializers.ValidationError("Public registration is limited to students.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CampusTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        identifier = attrs.pop("emailOrNim", None) or attrs.get("email")
        password = attrs.get("password")
        if identifier and "@" not in identifier:
            try:
                identifier = User.objects.get(nim_nip__iexact=identifier).email
            except User.DoesNotExist:
                pass
        attrs["email"] = identifier
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data