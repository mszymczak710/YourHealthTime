import uuid

import pytest
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.exceptions import ErrorDetail


@pytest.mark.django_db
def test_verify_email_successful(
    api_client, user_not_confirmed, email_verification_url
):
    response = api_client.get(email_verification_url)
    user_not_confirmed.refresh_from_db()

    assert (
        response.status_code,
        user_not_confirmed.email_confirmed,
        user_not_confirmed.is_active,
    ) == (status.HTTP_200_OK, True, True)


@pytest.mark.parametrize(
    "uid, token_key, expected_error",
    (
        (
            urlsafe_base64_encode(force_bytes("9999")),
            default_token_generator.make_token,
            ErrorDetail(
                string="Wartość „9999” nie jest poprawnym UUID-em.",
                code="invalid",
            ),
        ),
        (
            urlsafe_base64_encode(force_bytes(str(uuid.uuid4()))),
            default_token_generator.make_token,
            ErrorDetail(
                string="Nieprawidłowy identyfikator użytkownika.",
                code="invalid_uid",
            ),
        ),
        (
            lambda user: urlsafe_base64_encode(force_bytes(user.pk)),
            "invalidtoken",
            ErrorDetail(
                string="Token jest nieprawidłowy lub wygasł.",
                code="invalid_token",
            ),
        ),
    ),
)
@pytest.mark.django_db
def test_verify_email_invalid_args(
    api_client, user_not_confirmed, uid, token_key, expected_error
):
    token = token_key(user_not_confirmed) if callable(token_key) else token_key
    uid = uid(user_not_confirmed) if callable(uid) else uid

    url = reverse("verify-email", args=(uid, token))
    response = api_client.get(url)

    expected_response = {"non_field_errors": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
def test_verify_email_invalid_link(api_client):
    bad_uidb64 = "invalidUID"
    bad_token = "invalidToken"

    url = reverse("verify-email", args=(bad_uidb64, bad_token))
    response = api_client.get(url)

    expected_error = ErrorDetail(
        string="Nieprawidłowy identyfikator użytkownika.", code="invalid_uid"
    )
    expected_response = {"non_field_errors": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
def test_verify_email_already_verified(
    api_client, user_not_confirmed, email_verification_url
):
    user_not_confirmed.email_confirmed = True
    user_not_confirmed.save()

    response = api_client.get(email_verification_url)

    expected_error = "Adres e-mail został już zweryfikowany."
    expected_response = {"non_field_errors": [expected_error]}

    assert (
        response.status_code,
        response.data,
        user_not_confirmed.email_confirmed,
    ) == (status.HTTP_400_BAD_REQUEST, expected_response, True)
    user_not_confirmed.refresh_from_db()


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("post", "patch", "delete", "put"))
def test_verify_email_http_methods_not_allowed(
    api_client, email_verification_url, http_method
):
    method = getattr(api_client, http_method)
    response = method(email_verification_url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
