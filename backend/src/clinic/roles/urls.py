from django.urls import include, path
from rest_framework.routers import SimpleRouter

from clinic.roles.views import DoctorViewSet, NurseViewSet, PatientViewSet

router = SimpleRouter()
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"nurses", NurseViewSet, basename="nurse")
router.register(r"patients", PatientViewSet, basename="patient")

urlpatterns = [
    path("", include(router.urls)),
]
