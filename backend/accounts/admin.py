from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CampusUserAdmin(UserAdmin):
    model = User
    list_display = ("name", "email", "nim_nip", "role", "status", "department")
    search_fields = ("name", "email", "nim_nip")
    list_filter = ("role", "status", "department")
    ordering = ("name",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Identity", {"fields": ("name", "nim_nip", "role", "status", "department", "study_program", "semester", "phone", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined", "joined_date")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "nim_nip", "name", "password1", "password2", "role", "department", "phone")}),
    )