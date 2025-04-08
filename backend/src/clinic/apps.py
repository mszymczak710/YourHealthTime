from django.apps import AppConfig


class ClinicConfig(AppConfig):
    """
    The Django application configuration for the clinic app.

    This class configures the clinic application, setting the default
    auto field type to use BigAutoField and establishing 'clinic' as the
    application name which can be used in various parts of Django such as when
    referring to the app in settings or using the 'app_name:model_name' syntax.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "clinic"
