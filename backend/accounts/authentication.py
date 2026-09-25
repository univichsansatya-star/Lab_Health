from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import User


class StatusAwareJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user.status != User.Status.ACTIVE:
            raise AuthenticationFailed(
                "Akun tidak aktif. Silakan hubungi administrator.",
                code="account_disabled",
            )
        return user