import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken

USER_INFO_URL = "/auth/user-info/"


def get_auth_headers(user):
    token = AccessToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(token)}"}


@pytest.mark.django_db
@pytest.mark.parametrize(
    "instances, expected_email, expected_role, is_admin",
    [
        ("patient_instances", "pacjent1@example.com", "P", False),
        ("doctor_instances", "lekarz1@example.com", "D", False),
        ("nurse_instances", "pielegniarka1@example.com", "N", False),
        ("admin_instances", "admin1@example.com", "A", True),
    ],
)
def test_user_info_successful(
    api_client, request, instances, expected_email, expected_role, is_admin
):
    instance_list = request.getfixturevalue(instances)
    instance = instance_list[0]

    auth_headers = get_auth_headers(instance if is_admin else instance.user)

    response = api_client.get(USER_INFO_URL, **auth_headers)

    assert (
        response.status_code,
        response.data["email"],
        response.data["first_name"],
        response.data["last_name"],
        response.data["role"],
        response.data["profile_id"],
    ) == (
        status.HTTP_200_OK,
        expected_email,
        "Test",
        "User",
        expected_role,
        instance.id,
    )


def test_user_info_unauthenticated(api_client):
    url = reverse("user-info")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
