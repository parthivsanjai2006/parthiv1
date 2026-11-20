from django.contrib import admin
from .models import Dish, ContactMessage, Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'total', 'created_at')
    inlines = [OrderItemInline]

admin.site.register(Dish)
admin.site.register(ContactMessage)
admin.site.register(Order, OrderAdmin)