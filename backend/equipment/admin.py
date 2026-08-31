from django.contrib import admin
from .models import Equipment


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "category", "available_quantity", "condition", "location")
    search_fields = ("code", "name", "brand", "model", "location")
    list_filter = ("category", "condition", "is_consumable", "requires_special_approval")