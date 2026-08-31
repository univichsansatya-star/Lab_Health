import uuid
from django.conf import settings
from django.db import models
from equipment.models import Equipment


def make_id():
    return str(uuid.uuid4())


class BorrowingRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        READY_TO_PICKUP = "READY_TO_PICKUP", "Ready to Pickup"
        BORROWED = "BORROWED", "Borrowed"
        RETURN_REQUESTED = "RETURN_REQUESTED", "Return Requested"
        RETURNED = "RETURNED", "Returned"
        OVERDUE = "OVERDUE", "Overdue"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.CharField(primary_key=True, max_length=64, default=make_id, editable=False)
    ticket_number = models.CharField(max_length=40, unique=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="borrowing_requests")
    purpose = models.TextField()
    course_name = models.CharField(max_length=255, blank=True, default="")
    supervisor_lecturer = models.CharField(max_length=255, blank=True, default="")
    borrow_date = models.DateField()
    expected_return_date = models.DateField()
    actual_return_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True, default="")
    admin_notes = models.TextField(blank=True, default="")
    handover_staff_name = models.CharField(max_length=255, blank=True, default="")
    return_staff_name = models.CharField(max_length=255, blank=True, default="")
    signature_student = models.TextField(blank=True, default="")
    signature_staff = models.TextField(blank=True, default="")
    fine_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.ticket_number or str(self.id)


class BorrowingItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    request = models.ForeignKey(BorrowingRequest, on_delete=models.CASCADE, related_name="items")
    equipment = models.ForeignKey(Equipment, on_delete=models.PROTECT, related_name="borrowing_items")
    quantity = models.PositiveIntegerField()
    condition_at_borrow = models.CharField(max_length=30, choices=Equipment.Condition.choices, blank=True, null=True)
    condition_at_return = models.CharField(max_length=30, choices=Equipment.Condition.choices, blank=True, null=True)
    return_notes = models.TextField(blank=True, default="")