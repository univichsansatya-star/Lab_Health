from rest_framework.permissions import BasePermission

from .models import User


def _account_ok(user):
    return bool(
        user
        and user.is_authenticated
        and user.is_active
        and user.status == User.Status.ACTIVE
    )


class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return _account_ok(request.user) and request.user.is_staff_role


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return (
            _account_ok(request.user)
            and request.user.role == User.Role.ADMIN
        )