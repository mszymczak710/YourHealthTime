from django.db import models
from django.utils.translation import gettext_lazy as _


class VisitStatus(models.TextChoices):
    SCHEDULED = "S", _("Scheduled")
    IN_PROGRESS = "I", _("In progress")
    COMPLETED = "C", _("Completed")
