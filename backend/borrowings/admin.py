from django.contrib import admin
from .models import BorrowingItem, BorrowingRequest


class BorrowingItemInline(admin.TabularInline):
    model = BorrowingItem
    extra = 0


@admin.register(BorrowingRequest)
class BorrowingRequestAdmin(admin.ModelAdmin):
    list_display = ("ticket_number", "user", "status", "borrow_date", "expected_return_date", "created_at")
    search_fields = ("ticket_number", "user__name", "user__nim_nip")
    list_filter = ("status", "borrow_date", "expected_return_date")
    inlines = [BorrowingItemInline]


@admin.register(BorrowingItem)
class BorrowingItemAdmin(admin.ModelAdmin):
    list_display = ("request", "equipment", "quantity", "condition_at_borrow", "condition_at_return")
    search_fields = ("request__ticket_number", "equipment__code", "equipment__name")