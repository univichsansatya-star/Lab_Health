import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    CampusTokenObtainPairSerializer,
    MeSerializer,
    RegistrationSerializer,
)

logger = logging.getLogger(__name__)


def _cookie_kwargs():
    return {
        "path": settings.REFRESH_COOKIE_PATH,
        "httponly": True,
        "secure": settings.REFRESH_COOKIE_SECURE,
        "samesite": settings.REFRESH_COOKIE_SAMESITE,
        "max_age": settings.REFRESH_COOKIE_MAX_AGE,
    }


def _set_refresh_cookie(response, refresh_token):
    response.set_cookie(settings.REFRESH_COOKIE_NAME, refresh_token, **_cookie_kwargs())
    return response


def _delete_refresh_cookie(response):
    response.delete_cookie(settings.REFRESH_COOKIE_NAME, path=settings.REFRESH_COOKIE_PATH)
    return response


def _get_refresh_token(request):
    return request.COOKIES.get(settings.REFRESH_COOKIE_NAME)


class AuthScopedThrottle(ScopedRateThrottle):
    scope = "auth"


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegistrationSerializer
    throttle_classes = [AuthScopedThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = Response({
            "access": str(refresh.access_token),
            "user": MeSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
        return _set_refresh_cookie(response, str(refresh))


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CampusTokenObtainPairSerializer
    throttle_classes = [AuthScopedThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc

        data = serializer.validated_data
        response = Response({
            "access": data["access"],
            "user": data["user"],
        })
        return _set_refresh_cookie(response, data["refresh"])


class CookieRefreshView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthScopedThrottle]

    def post(self, request):
        refresh_token = _get_refresh_token(request)
        if not refresh_token:
            raise InvalidToken("Refresh token tidak ditemukan.")

        try:
            refresh = RefreshToken(refresh_token)
            refresh.verify()
            refresh.blacklist()
        except TokenError as exc:
            raise InvalidToken(exc.args[0]) from exc

        new_refresh = RefreshToken()
        for claim, value in refresh.payload.items():
            if claim not in ("token_type", "jti", "iat", "exp"):
                new_refresh[claim] = value
        new_refresh.set_jti()
        new_refresh.set_iat()
        new_refresh.set_exp()
        response = Response({"access": str(new_refresh.access_token)})
        return _set_refresh_cookie(response, str(new_refresh))


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = _get_refresh_token(request)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                logger.info("Logout with invalid refresh token for user %s", request.user.pk)
        response = Response({"detail": "Berhasil keluar."}, status=status.HTTP_205_RESET_CONTENT)
        return _delete_refresh_cookie(response)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MeSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


class PasswordResetRequestSerializer(serializers.Serializer):
    email_or_nim = serializers.CharField(min_length=3)


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [AuthScopedThrottle]

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
            try:
                send_mail(
                    "Reset Password UIS Health Lab",
                    f"Gunakan tautan berikut untuk membuat password baru:\n\n{reset_url}\n\nTautan ini hanya dapat digunakan sekali dan akan kedaluwarsa.",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception:
                logger.exception("Failed to send password reset email for user %s", user.pk)
        return Response({"detail": "Jika akun terdaftar, instruksi reset password telah dikirim."}, status=202)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=12, write_only=True)


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    throttle_classes = [AuthScopedThrottle]

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