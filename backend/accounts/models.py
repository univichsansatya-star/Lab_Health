import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


def make_id():
    return str(uuid.uuid4())


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        NURSE_STAFF = "nurse_staff", "Nurse Staff"
        ADMIN = "admin", "Admin"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        SUSPENDED = "SUSPENDED", "Suspended"
        PENDING_VERIFICATION = "PENDING_VERIFICATION", "Pending Verification"

    id = models.CharField(primary_key=True, max_length=64, default=make_id, editable=False)
    username = None
    name = models.CharField(max_length=255)
    nim_nip = models.CharField(max_length=64, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    department = models.CharField(max_length=255)
    study_program = models.CharField(max_length=255, blank=True, null=True)
    semester = models.PositiveSmallIntegerField(blank=True, null=True)
    phone = models.CharField(max_length=40)
    avatar = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    joined_date = models.DateField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nim_nip"]

    def __str__(self):
        return f"{self.name} ({self.nim_nip})"

    @property
    def is_staff_role(self):
        return self.role in {self.Role.NURSE_STAFF, self.Role.ADMIN}