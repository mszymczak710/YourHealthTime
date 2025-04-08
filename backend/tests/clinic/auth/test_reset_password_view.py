import pytest
from rest_framework import status
from rest_framework.exceptions import ErrorDetail

RESET_PASSWORD_URL = "/auth/reset-password/"


@pytest.mark.django_db
@pytest.mark.parametrize(
    "verify_recaptcha_return, send_email_called",
    (
        (True, False),
        (True, True),
    ),
)
def test_reset_password_successful(
    api_client,
    mocker,
    user_data,
    user,
    verify_recaptcha_return,
    send_email_called,
):
    mocker.patch(
        "clinic.auth.serializers.verify_recaptcha",
        return_value=verify_recaptcha_return,
    )
    mocked_send_email = None
    if send_email_called:
        mocked_send_email = mocker.patch(
            "clinic.mixins.MailSendingMixin.send_email"
        )

    reset_passwd_data = {
        "email": user.email,
        "recaptcha_response": user_data["recaptcha_response"],
    }

    response = api_client.post(
        RESET_PASSWORD_URL, data=reset_passwd_data, format="json"
    )

    assert response.status_code == status.HTTP_200_OK

    if send_email_called:
        mocked_send_email.assert_called_once()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_email, recaptcha_response, mock_verify_recaptcha_return, expected_status, expected_response",
    (
        (
            "valid_email@example.com",
            "invalid_recaptcha_response",
            False,
            status.HTTP_400_BAD_REQUEST,
            {
                "recaptcha_response": [
                    "Nieprawidłowa reCAPTCHA. Spróbuj ponownie."
                ]
            },
        ),
        (
            "valid_email@example.com",
            None,
            True,
            status.HTTP_400_BAD_REQUEST,
            {
                "recaptcha_response": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ]
            },
        ),
    ),
)
def test_reset_password_invalid_captcha(
    api_client,
    mocker,
    user,
    user_email,
    recaptcha_response,
    mock_verify_recaptcha_return,
    expected_status,
    expected_response,
):
    user.email = (
        user_email if user_email != "valid_email@example.com" else user.email
    )
    mocker.patch(
        "clinic.auth.serializers.verify_recaptcha",
        return_value=mock_verify_recaptcha_return,
    )

    reset_passwd_data = {"email": user.email}
    if recaptcha_response is not None:
        reset_passwd_data["recaptcha_response"] = recaptcha_response

    response = api_client.post(
        RESET_PASSWORD_URL, data=reset_passwd_data, format="json"
    )

    assert (response.status_code, response.data) == (
        expected_status,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "reset_passwd_data, content_type, expected_status, expected_response",
    (
        (
            "email=test@example.com&recaptcha_response=valid_recaptcha",
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
            {},
            "application/json",
            status.HTTP_400_BAD_REQUEST,
            {
                "email": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "recaptcha_response": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
            },
        ),
    ),
)
def test_reset_password_invalid_data_format(
    api_client,
    mocker,
    reset_passwd_data,
    content_type,
    expected_status,
    expected_response,
):
    if content_type == "application/json":
        mocker.patch(
            "clinic.auth.serializers.verify_recaptcha", return_value=True
        )

    if isinstance(reset_passwd_data, dict):
        response = api_client.post(
            RESET_PASSWORD_URL, data=reset_passwd_data, format="json"
        )
    else:
        response = api_client.post(
            RESET_PASSWORD_URL,
            data=reset_passwd_data,
            content_type=content_type,
        )

    assert (response.status_code, response.data) == (
        expected_status,
        expected_response,
    )


@pytest.mark.django_db
def test_reset_password_nonexistent_user(api_client, mocker, user_data, user):
    user.email = "nonexistent@example.com"
    reset_passwd_data = {
        "email": user.email,
        "recaptcha_response": user_data["recaptcha_response"],
    }
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)
    response = api_client.post(
        RESET_PASSWORD_URL, data=reset_passwd_data, format="json"
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_reset_password_unconfirmed_email(
    api_client, mocker, user_data, user_not_confirmed
):
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)
    reset_passwd_data = {
        "email": user_not_confirmed.email,
        "recaptcha_response": user_data["recaptcha_response"],
    }

    response = api_client.post(
        RESET_PASSWORD_URL, data=reset_passwd_data, format="json"
    )

    expected_error = ErrorDetail(
        string="Aby zresetować hasło, najpierw potwierdź swój adres e-mail.",
        code="permission_denied",
    )
    expected_response = {"non_field_errors": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_403_FORBIDDEN,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("get", "patch", "delete", "put"))
def test_reset_password_http_methods_not_allowed(api_client, http_method):
    method = getattr(api_client, http_method)
    response = method(RESET_PASSWORD_URL)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
