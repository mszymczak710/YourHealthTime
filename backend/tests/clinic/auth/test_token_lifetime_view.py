import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken


@pytest.fixture
def auth_headers(user):
    token = AccessToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}


def test_token_lifetime_view_returns_expected_data(
    api_client, auth_headers, settings
):
    url = reverse("token-lifetime")

    response = api_client.get(url, **auth_headers)
    expected_seconds = int(
        settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
    )

    assert (
        response.status_code,
        response.data["access_token_lifetime_seconds"],
    ) == (status.HTTP_200_OK, expected_seconds)


def test_token_lifetime_view_unauthorized(api_client):
    url = reverse("token-lifetime")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
