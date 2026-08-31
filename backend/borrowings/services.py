from datetime import datetime
from secrets import randbelow
from django.utils import timezone
from .models import BorrowingRequest


def next_ticket_number():
    prefix = timezone.localdate().strftime("%Y%m")
    while True:
        candidate = f"REQ-{prefix}-{1000 + randbelow(9000)}"
        if not BorrowingRequest.objects.filter(ticket_number=candidate).exists():
            return candidate