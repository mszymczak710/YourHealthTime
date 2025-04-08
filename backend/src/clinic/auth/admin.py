from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from clinic.auth.models import User


class UserAdminConfig(UserAdmin):
    model = User
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("role", "email_confirmed", "is_active")
    list_per_page = 10
    ordering = ("-register_date",)
    list_display = (
        "id",
        "readable_id",
        "email",
        "first_name",
        "last_name",
        "role",
        "register_date",
        "email_confirmed",
        "is_active",
    )
    fieldsets = (
        (
            _("Personal"),
            {
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "is_active",
                    "email_confirmed",
                )
            },
        ),
        (_("Permissions"), {"fields": ("role",)}),
    )
    add_fieldsets = (
        (
            _("Personal"),
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "is_active",
                    "email_confirmed",
                ),
            },
        ),
        (_("Permissions"), {"classes": ("wide",), "fields": ("role",)}),
        (
            "Password",
            {"classes": ("wide",), "fields": ("password1", "password2")},
        ),
    )
