import pytest


@pytest.mark.parametrize(
    "instances, expected_str",
    (
        ("doctor_instances", "Test Doctor (1000041)"),
        ("nurse_instances", "Test Nurse (1234568)"),
        ("patient_instances", "Test Patient (91011112314)"),
    ),
)
def test_role_models_str_representation(request, instances, expected_str):
    instance_list = request.getfixturevalue(instances)
    instance = instance_list[0]
    assert str(instance) == expected_str
