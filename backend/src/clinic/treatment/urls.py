from django.urls import include, path
from rest_framework.routers import SimpleRouter

from clinic.treatment.views import PrescriptionViewSet, VisitViewSet

router = SimpleRouter()
router.register(r"prescriptions", PrescriptionViewSet, basename="prescription")
router.register(r"visits", VisitViewSet, basename="visit")

urlpatterns = [
    path("", include(router.urls)),
]
