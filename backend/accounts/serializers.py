from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
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


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "name", "nim_nip", "email", "role", "department",
            "study_program", "semester", "phone", "avatar", "status", "joined_date",
        ]
        read_only_fields = ["id", "nim_nip", "email", "role", "status", "joined_date"]


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=12)

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


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=12)

    class Meta:
        model = User
        fields = [
            "name", "nim_nip", "email", "password", "role", "department",
            "study_program", "semester", "phone", "avatar",
        ]

    def validate_role(self, value):
        requester = self.context["request"].user
        if requester.role != User.Role.ADMIN and value != User.Role.STUDENT:
            raise serializers.ValidationError(
                "Only admins may assign privileged roles."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_staff = user.role in {User.Role.NURSE_STAFF, User.Role.ADMIN}
        user.save()
        return user


class CampusTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"
    email = serializers.CharField(required=False, write_only=True)
    emailOrNim = serializers.CharField(required=False, write_only=True)

    def validate(self, attrs):
        identifier = attrs.pop("emailOrNim", None) or attrs.get("email")
        password = attrs.get("password")
        if identifier and "@" not in identifier:
            try:
                identifier = User.objects.get(nim_nip__iexact=identifier).email
            except User.DoesNotExist:
                pass
        attrs["email"] = identifier

        user = authenticate(
            request=self.context.get("request"),
            email=identifier,
            password=password,
        )
        if user is None or not user.is_active:
            raise AuthenticationFailed(
                "No active account found with the given credentials",
                "no_active_account",
            )
        if user.status != User.Status.ACTIVE:
            raise AuthenticationFailed(
                "Akun tidak aktif. Silakan hubungi administrator.",
                "account_disabled",
            )
        self.user = user
        refresh = self.get_token(user)
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        data["user"] = UserSerializer(self.user).data
        return data