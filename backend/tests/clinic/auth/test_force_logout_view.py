import pytest
from rest_framework import status
from rest_framework.exceptions import ErrorDetail

FORCE_LOGOUT_URL = "/auth/force-logout/"


@pytest.mark.django_db
def test_force_logout_successful(api_client, user):
    user.is_logged_in = True
    user.save()

    response = api_client.post(
        FORCE_LOGOUT_URL,
        data={"email": user.email},
        format="json",
    )

    user.refresh_from_db()

    assert (response.status_code, user.is_logged_in) == (
        status.HTTP_204_NO_CONTENT,
        False,
    )


@pytest.mark.django_db
def test_force_logout_user_not_found(api_client):
    response = api_client.post(
        FORCE_LOGOUT_URL,
        data={"email": "nonexistent@example.com"},
        format="json",
    )

    expected_error = {
        "non_field_errors": [
            ErrorDetail(
                string="Użytkownik o podanym adresie e-mail nie istnieje.",
                code="invalid",
            )
        ]
    }

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_error,
    )


@pytest.mark.django_db
def test_force_logout_missing_email(api_client):
    response = api_client.post(
        FORCE_LOGOUT_URL,
        data={},
        format="json",
    )

    expected_error = {
        "non_field_errors": [
            ErrorDetail(string="Nieprawidłowe dane.", code="invalid")
        ]
    }

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_error,
    )


@pytest.mark.django_db
def test_force_logout_invalid_content_type(api_client):
    response = api_client.post(
        FORCE_LOGOUT_URL,
        data="email=user@example.com",
        content_type="application/x-www-form-urlencoded",
    )

    expected_errur = {
        "detail": ErrorDetail(
            string='Brak wsparcia dla żądanego typu danych "application/x-www-form-urlencoded".',
            code="unsupported_media_type",
        )
    }

    assert (response.status_code, response.data) == (
        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        expected_errur,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("get", "put", "patch", "delete"))
def test_force_logout_http_methods_not_allowed(api_client, http_method):
    method = getattr(api_client, http_method)
    response = method(FORCE_LOGOUT_URL)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
