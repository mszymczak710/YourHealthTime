from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView

from clinic.auth.views import (
    ChangePasswordView,
    ForceLogoutView,
    LoginView,
    LogoutView,
    RegisterView,
    ResetPasswordConfirmView,
    ResetPasswordView,
    TokenLifetimeView,
    UserInfoView,
    VerifyEmailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path(
        "verify-email/<str:uidb64>/<str:token>/",
        VerifyEmailView.as_view(),
        name="verify-email",
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("force-logout/", ForceLogoutView.as_view(), name="force-logout"),
    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password",
    ),
    re_path(
        r"^reset-password-confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,40})/$",
        ResetPasswordConfirmView.as_view(),
        name="reset-password-confirm",
    ),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path(
        "token/lifetime/", TokenLifetimeView.as_view(), name="token-lifetime"
    ),
    path("user-info/", UserInfoView.as_view(), name="user-info"),
]
