from datetime import datetime, timedelta, timezone

import pytest
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.exceptions import ErrorDetail


@pytest.mark.django_db
def test_reset_password_confirm_successful(
    api_client, user, reset_password_url, set_password_data
):
    response = api_client.post(
        reset_password_url, data=set_password_data, format="json"
    )

    user.refresh_from_db()
    assert (
        response.status_code,
        user.check_password(set_password_data["password"]),
    ) == (
        status.HTTP_200_OK,
        True,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "uidb64, token, expected_error",
    (
        (
            "wrong-uid",
            "wrong-token",
            "Nieprawidłowy UID lub użytkownik nie znaleziony.",
        ),
        (
            "invalid_format",
            "some-token",
            "Nieprawidłowy UID lub użytkownik nie znaleziony.",
        ),
    ),
)
def test_reset_password_confirm_invalid_token_or_uid(
    api_client, uidb64, token, expected_error
):
    wrong_reset_password_url = reverse(
        "reset-password-confirm",
        kwargs={"uidb64": uidb64, "token": token},
    )
    response = api_client.post(wrong_reset_password_url, {}, format="json")

    expected_response = {"non_field_errors": expected_error}
    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
def test_reset_password_confirm_inactive_user(
    api_client, user, reset_password_url, set_password_data
):
    user.is_active = False
    user.save()

    response = api_client.post(
        reset_password_url, data=set_password_data, format="json"
    )

    expected_error = "Użytkownik jest nieaktywny. Skontaktuj się z pomocą techniczną, aby uzyskać wsparcie."
    expected_response = {"non_field_errors": [expected_error]}
    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "data, content_type, expected_status, expected_detail",
    (
        (
            "password=newpassword123&password_confirm=newpassword123",
            "application/x-www-form-urlencoded",
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            {
                "detail": ErrorDetail(
                    string='Brak wsparcia dla żądanego typu danych "application/x-www-form-urlencoded".',
                    code="unsupported_media_type",
                )
            },
        ),
        (
            "this is not valid json",
            "application/json",
            status.HTTP_400_BAD_REQUEST,
            {
                "detail": "JSON parse error - Expecting value: line 1 column 1 (char 0)"
            },
        ),
        (
            None,
            "application/json",
            status.HTTP_400_BAD_REQUEST,
            {
                "password": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "password_confirm": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
            },
        ),
    ),
)
def test_reset_password_confirm_invalid_data_format(
    api_client,
    reset_password_url,
    data,
    content_type,
    expected_status,
    expected_detail,
):
    response = api_client.post(
        reset_password_url,
        data=data,
        content_type=content_type,
    )

    expected_response = expected_detail
    if expected_response:
        assert (response.status_code, response.data) == (
            expected_status,
            expected_response,
        )
    else:
        assert response.status_code == expected_status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "password, password_confirm, expected_response",
    (
        (
            "short",
            "short",
            {
                "password": [
                    ErrorDetail(
                        string="To hasło jest za krótkie. Musi zawierać co najmniej 8 znaków.",
                        code="password_too_short",
                    ),
                    ErrorDetail(
                        string="Upewnij się, że pole ma co najmniej 8 znaków.",
                        code="min_length",
                    ),
                ],
                "password_confirm": [
                    ErrorDetail(
                        string="Upewnij się, że pole ma co najmniej 8 znaków.",
                        code="min_length",
                    )
                ],
            },
        ),
        (
            "password123",
            "password123",
            {
                "password": [
                    ErrorDetail(
                        string="To hasło jest zbyt powszechne.",
                        code="password_too_common",
                    )
                ]
            },
        ),
        (
            "newpassword123",
            "differentpassword123",
            {"password_confirm": ["Hasła muszą być identyczne."]},
        ),
    ),
)
def test_reset_password_confirm_password_validations(
    api_client,
    reset_password_url,
    password,
    password_confirm,
    expected_response,
):
    set_password_data = {
        "password": password,
        "password_confirm": password_confirm,
    }

    response = api_client.post(
        reset_password_url, data=set_password_data, format="json"
    )

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
def test_reset_password_confirm_nonexistent_user(
    api_client, set_password_data
):
    valid_uid_format_but_nonexistent_user = "some_base64_encoded_uid"
    wrong_reset_password_url = reverse(
        "reset-password-confirm",
        kwargs={
            "uidb64": valid_uid_format_but_nonexistent_user,
            "token": "some-token",
        },
    )
    response = api_client.post(
        wrong_reset_password_url, data=set_password_data, format="json"
    )

    expected_error = "Nieprawidłowy UID lub użytkownik nie znaleziony."
    expected_response = {"non_field_errors": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "token_action",
    (
        ("token_for_other_user"),
        ("double_use_token"),
    ),
)
def test_reset_password_confirm_token_issues(
    api_client,
    user,
    reset_password_url,
    set_password_data,
    token_action,
):
    if token_action == "token_for_other_user":
        user_uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        second_user_token = "some-token"
        url = reverse(
            "reset-password-confirm",
            kwargs={"uidb64": user_uidb64, "token": second_user_token},
        )

    elif token_action == "double_use_token":
        api_client.post(
            reset_password_url, data=set_password_data, format="json"
        )
        url = reset_password_url

    response = api_client.post(url, set_password_data, format="json")

    expected_error = "Link do resetowania hasła jest nieprawidłowy lub wygasł. Proszę poprosić o nowy."
    expected_response = {"non_field_errors": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
def test_reset_password_confirm_token_expiry(
    api_client, user, reset_password_url, set_password_data
):
    user.password_reset_sent_at = datetime.now(timezone.utc) - timedelta(
        hours=23
    )
    user.save()
    response = api_client.post(
        reset_password_url, data=set_password_data, format="json"
    )
    assert response.status_code == status.HTTP_200_OK

    user.password_reset_sent_at = datetime.now(timezone.utc) - timedelta(
        hours=24, minutes=1
    )
    user.save()

    response = api_client.post(
        reset_password_url, data=set_password_data, format="json"
    )

    expected_error = (
        "Link do resetowania hasła wygasł. Proszę poprosić o nowy."
    )
    expected_response = {"non_field_errors": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("get", "patch", "delete", "put"))
def test_reset_password_confirm_http_methods_not_allowed(
    api_client, reset_password_url, http_method
):
    method = getattr(api_client, http_method)
    response = method(reset_password_url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
