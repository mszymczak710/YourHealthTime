import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import ErrorDetail


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture",
    (
        ("authenticated_doctor"),
        ("authenticated_nurse"),
        ("authenticated_patient"),
    ),
)
def test_user_role_can_list_offices(request, user_fixture, office_instances):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("office-list")
    ordering = "readable_id"
    response = api_client.get(f"{url}?ordering={ordering}")
    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        6,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture",
    (
        ("authenticated_doctor"),
        ("authenticated_nurse"),
        ("authenticated_patient"),
    ),
)
def test_filter_office_by_office_type__name(
    request, user_fixture, office_instances
):
    search_query = "Gabinet medycyny rodzinnej"
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("office-list")
    ordering = "readable_id"
    response = api_client.get(
        f"{url}?office_type__name={search_query}&ordering={ordering}"
    )

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        2,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture",
    (
        ("authenticated_doctor"),
        ("authenticated_nurse"),
        ("authenticated_patient"),
    ),
)
@pytest.mark.parametrize(
    "first_filter_param, first_filter_value, second_filter_param, second_filter_value, expected_count",
    (
        ("floor_min", "0", "floor_max", "1", 4),
        ("room_number_min", "100", "room_number_max", "102", 2),
    ),
)
def test_double_filter_office(
    request,
    user_fixture,
    first_filter_param,
    first_filter_value,
    second_filter_param,
    second_filter_value,
    expected_count,
    office_instances,
):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("office-list")
    ordering = "readable_id"
    response = api_client.get(
        f"{url}?{first_filter_param}={first_filter_value}&{second_filter_param}={second_filter_value}&ordering={ordering}"
    )

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        expected_count,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture",
    (
        ("authenticated_doctor"),
        ("authenticated_nurse"),
        ("authenticated_patient"),
    ),
)
def test_user_role_can_retrieve_specific_office_details(
    request, user_fixture, office_instances
):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("office-detail", args=(office_instances[0].pk,))
    response = api_client.get(url)
    assert (
        response.status_code,
        response.data["office_type"]["name"],
        response.data["floor"],
        response.data["room_number"],
    ) == (status.HTTP_200_OK, "Gabinet medycyny rodzinnej", 1, 101)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture",
    (
        ("authenticated_doctor"),
        ("authenticated_nurse"),
        ("authenticated_patient"),
    ),
)
def test_user_role_cannot_retrieve_details_of_nonexistent_office(
    request, user_fixture, random_uuid
):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("office-detail", args=(str(random_uuid),))
    response = api_client.get(url)

    expected_error = ErrorDetail("Nie znaleziono.", code="not_found")
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_404_NOT_FOUND,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("url_name", (("office-list"), ("office-detail")))
def test_unauthenticated_user_cannot_list_or_retrieve_offices(
    api_client, office_instances, url_name
):
    office = office_instances[0]
    url = reverse(url_name, args=(office.pk,) if "detail" in url_name else ())
    response = api_client.get(url)

    expected_error = ErrorDetail(
        "Nie podano danych uwierzytelniających.", code="not_authenticated"
    )
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_401_UNAUTHORIZED,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("delete", "patch", "put"))
@pytest.mark.parametrize(
    "user_fixture",
    (
        ("authenticated_doctor"),
        ("authenticated_nurse"),
        ("authenticated_patient"),
    ),
)
def test_invalid_http_methods_are_rejected_on_office_detail(
    request, user_fixture, http_method, office_instances
):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("office-detail", args=(office_instances[0].pk,))

    method = getattr(api_client, http_method)
    response = method(url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture",
    (
        ("authenticated_doctor"),
        ("authenticated_nurse"),
        ("authenticated_patient"),
    ),
)
def test_post_method_not_supported_for_offices_list(request, user_fixture):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("office-list")
    office_data = {"office_type": "Kardiologiczny", "floor": "4"}

    response = api_client.post(url, office_data, format="json")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
