import json
import os
import re
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware

from accounts.models import User
from borrowings.models import BorrowingItem, BorrowingRequest
from equipment.models import Equipment
from maintenance.models import MaintenanceRecord
from notifications.models import Notification
from rooms.models import LabRoom


class JavaScriptLiteralParser:
    """Small parser for the literal arrays in frontend/src/services/mockData.ts."""

    def __init__(self, value):
        self.value = value
        self.index = 0

    def parse(self):
        self.skip_space()
        return self.parse_value()

    def skip_space(self):
        while self.index < len(self.value) and self.value[self.index].isspace():
            self.index += 1

    def parse_value(self):
        self.skip_space()
        char = self.value[self.index]
        if char == "[":
            return self.parse_array()
        if char == "{":
            return self.parse_object()
        if char in "'\"":
            return self.parse_string()
        for literal, result in (("true", True), ("false", False), ("null", None)):
            if self.value.startswith(literal, self.index):
                self.index += len(literal)
                return result
        match = re.match(r"-?\d+(?:\.\d+)?", self.value[self.index:])
        if not match:
            raise ValueError(f"Unexpected literal at position {self.index}")
        self.index += len(match.group(0))
        number = match.group(0)
        return float(number) if "." in number else int(number)

    def parse_string(self):
        quote = self.value[self.index]
        self.index += 1
        chars = []
        while self.index < len(self.value):
            char = self.value[self.index]
            self.index += 1
            if char == quote:
                return "".join(chars)
            if char == "\\" and self.index < len(self.value):
                escaped = self.value[self.index]
                self.index += 1
                chars.append({"n": "\n", "r": "\r", "t": "\t"}.get(escaped, escaped))
            else:
                chars.append(char)
        raise ValueError("Unterminated string")

    def parse_array(self):
        self.index += 1
        result = []
        while True:
            self.skip_space()
            if self.value[self.index] == "]":
                self.index += 1
                return result
            result.append(self.parse_value())
            self.skip_space()
            if self.value[self.index] == ",":
                self.index += 1
                continue
            if self.value[self.index] == "]":
                self.index += 1
                return result
            raise ValueError("Expected comma or closing array bracket")

    def parse_object(self):
        self.index += 1
        result = {}
        while True:
            self.skip_space()
            if self.value[self.index] == "}":
                self.index += 1
                return result
            if self.value[self.index] in "'\"":
                key = self.parse_string()
            else:
                match = re.match(r"[A-Za-z_$][\w$]*", self.value[self.index:])
                if not match:
                    raise ValueError(f"Invalid object key at position {self.index}")
                key = match.group(0)
                self.index += len(key)
            self.skip_space()
            if self.value[self.index] != ":":
                raise ValueError("Expected colon after object key")
            self.index += 1
            result[key] = self.parse_value()
            self.skip_space()
            if self.value[self.index] == ",":
                self.index += 1
                continue
            if self.value[self.index] == "}":
                self.index += 1
                return result
            raise ValueError("Expected comma or closing object bracket")


def read_demo_data():
    source_path = Path(__file__).resolve().parents[4] / "frontend" / "src" / "services" / "mockData.ts"
    source = source_path.read_text(encoding="utf-8")
    arrays = {}
    names = [
        "INITIAL_USERS", "LAB_ROOMS", "INITIAL_EQUIPMENT",
        "INITIAL_BORROWING_REQUESTS", "INITIAL_MAINTENANCE_RECORDS",
        "INITIAL_NOTIFICATIONS",
    ]
    for name in names:
        match = re.search(rf"export const {name}\b[^=]*=\s*", source)
        if not match:
            raise RuntimeError(f"Could not find {name} in {source_path}")
        arrays[name] = JavaScriptLiteralParser(source[match.end():]).parse()
    return arrays


def parse_date(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00")) if "T" in value else datetime.strptime(value, "%Y-%m-%d").date()


class Command(BaseCommand):
    help = "Recreate demo users, equipment, rooms, borrowings, maintenance, and notifications from mockData.ts."

    def handle(self, *args, **options):
        data = read_demo_data()
        Notification.objects.all().delete()
        BorrowingItem.objects.all().delete()
        BorrowingRequest.objects.all().delete()
        MaintenanceRecord.objects.all().delete()
        Equipment.objects.all().delete()
        LabRoom.objects.all().delete()
        User.objects.all().delete()

        users = {}
        for item in data["INITIAL_USERS"]:
            user = User(
                id=item["id"], name=item["name"], nim_nip=item["nim_nip"],
                email=item["email"], role=item["role"], department=item["department"],
                study_program=item.get("studyProgram"), semester=item.get("semester"),
                phone=item["phone"], avatar=item.get("avatar"), status=item["status"],
            )
            user.set_password("password123")
            user.save(force_insert=True)
            User.objects.filter(pk=user.pk).update(joined_date=parse_date(item["joinedDate"]))
            users[user.id] = user

        for item in data["LAB_ROOMS"]:
            LabRoom.objects.create(
                id=item["id"], code=item["code"], name=item["name"], building=item["building"],
                floor=item["floor"], capacity=item["capacity"], supervisor=item["supervisor"],
                status=item["status"], active_class=item.get("activeClass", ""),
            )

        for item in data["INITIAL_EQUIPMENT"]:
            equipment = Equipment.objects.create(
                id=item["id"], code=item["code"], name=item["name"], category=item["category"],
                brand=item["brand"], model=item["model"], description=item["description"],
                total_quantity=item["totalQuantity"], available_quantity=item["availableQuantity"],
                borrowed_quantity=item["borrowedQuantity"], maintenance_quantity=item["maintenanceQuantity"],
                condition=item["condition"], location=item["location"], image_url=item.get("imageUrl", ""),
                specifications=item["specifications"], usage_guidelines=item["usageGuidelines"],
                is_consumable=item["isConsumable"], requires_special_approval=item["requiresSpecialApproval"],
                qr_code=item.get("qrCode", ""), last_inspection_date=parse_date(item["lastInspectionDate"]),
            )
            if "createdAt" in item:
                Equipment.objects.filter(pk=equipment.pk).update(created_at=parse_date(item["createdAt"]))

        for item in data["INITIAL_BORROWING_REQUESTS"]:
            request = BorrowingRequest.objects.create(
                id=item["id"], ticket_number=item["ticketNumber"], user=users[item["userId"]],
                purpose=item["purpose"], course_name=item.get("courseName", ""),
                supervisor_lecturer=item.get("supervisorLecturer", ""),
                borrow_date=parse_date(item["borrowDate"]),
                expected_return_date=parse_date(item["expectedReturnDate"]),
                actual_return_date=parse_date(item["actualReturnDate"]) if item.get("actualReturnDate") else None,
                status=item["status"], rejection_reason=item.get("rejectionReason", ""),
                admin_notes=item.get("adminNotes", ""), handover_staff_name=item.get("handoverStaffName", ""),
                return_staff_name=item.get("returnStaffName", ""), signature_student=item.get("signatureStudent", ""),
                signature_staff=item.get("signatureStaff", ""), fine_amount=item.get("fineAmount"),
            )
            for line in item["items"]:
                BorrowingItem.objects.create(
                    request=request, equipment_id=line["equipmentId"], quantity=line["quantity"],
                    condition_at_borrow=line.get("conditionAtBorrow"),
                    condition_at_return=line.get("conditionAtReturn"),
                    return_notes=line.get("returnNotes", ""),
                )
            BorrowingRequest.objects.filter(pk=request.pk).update(
                created_at=parse_date(item["createdAt"]),
                updated_at=parse_date(item["updatedAt"]),
            )

        for item in data["INITIAL_MAINTENANCE_RECORDS"]:
            record = MaintenanceRecord.objects.create(
                id=item["id"], ticket_number=item["ticketNumber"], equipment_id=item["equipmentId"],
                issue_description=item["issueDescription"], reported_by=item["reportedBy"],
                status=item["status"], technician=item.get("technician", ""), cost=item.get("cost"),
                notes=item.get("notes", ""), completed_date=parse_date(item["completedDate"]) if item.get("completedDate") else None,
                priority=item["priority"],
            )
            MaintenanceRecord.objects.filter(pk=record.pk).update(reported_date=parse_date(item["reportedDate"]))

        for item in data["INITIAL_NOTIFICATIONS"]:
            Notification.objects.create(
                id=item["id"], user_id=item.get("userId"), target_role=item.get("targetRole"),
                title=item["title"], message=item["message"], type=item["type"],
                is_read=item["isRead"], link=item.get("link", ""),
            )
            if item.get("createdAt"):
                Notification.objects.filter(pk=item["id"]).update(created_at=parse_date(item["createdAt"]))

        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@ichsansatya.ac.id")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin12345")
        admin, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "id": "usr-superuser", "name": "UIS Health Lab Administrator",
                "nim_nip": "SYSTEM-ADMIN", "role": User.Role.ADMIN,
                "department": "System Administration", "phone": "",
                "is_staff": True, "is_superuser": True,
            },
        )
        admin.role = User.Role.ADMIN
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password(password)
        admin.save()
        self.stdout.write(self.style.SUCCESS("Demo data seeded from frontend/src/services/mockData.ts."))
        self.stdout.write(f"Superuser email: {email}")
        self.stdout.write(f"Superuser password: {password}")