from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    CampusTokenObtainPairSerializer,
    RegistrationSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CampusTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            self.get_object(), data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        allowed = {
            "name", "department", "study_program", "semester", "phone", "avatar"
        }
        serializer.save(**{key: value for key, value in serializer.validated_data.items() if key in allowed})
        return Response(self.get_serializer(self.get_object()).data)


class PasswordResetRequestSerializer(serializers.Serializer):
    email_or_nim = serializers.CharField(min_length=3)


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["email_or_nim"]
        user = User.objects.filter(email__iexact=identifier).first()
        if user is None:
            user = User.objects.filter(nim_nip__iexact=identifier).first()
        if user and user.is_active and user.status == User.Status.ACTIVE:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/confirm?uid={uid}&token={token}"
            send_mail(
                "Reset Password UIS Health Lab",
                f"Gunakan tautan berikut untuk membuat password baru:\n\n{reset_url}\n\nTautan ini hanya dapat digunakan sekali dan akan kedaluwarsa.",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        return Response({"detail": "Jika akun terdaftar, instruksi reset password telah dikirim."}, status=202)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_id = urlsafe_base64_decode(serializer.validated_data["uid"]).decode()
            user = User.objects.get(pk=user_id)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"detail": "Tautan reset password tidak valid atau sudah kedaluwarsa."})
        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            raise serializers.ValidationError({"detail": "Tautan reset password tidak valid atau sudah kedaluwarsa."})
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password berhasil diubah."})