import pytest


@pytest.mark.parametrize(
    "instances, expected_str",
    (
        (
            "visit_instances",
            "Visit (01.12.2025, 10:00) - Patient: Test Patient (91011112314), Doctor: Test Doctor (1000041)",
        ),
        (
            "prescription_instances",
            "Prescription ([issue_date] - [expiry_date]) - Patient: Test Patient (91011112314), Doctor: Test Doctor (1000041)",
        ),
    ),
)
def test_treatment_models_str_representation(request, instances, expected_str):
    instance_list = request.getfixturevalue(instances)
    instance = instance_list[0]

    if instances == "prescription_instances":
        issue_date = instance.issue_date.strftime("%d.%m.%Y")
        expiry_date = instance.expiry_date.strftime("%d.%m.%Y")
        expected_str = expected_str.replace(
            "[issue_date]", issue_date
        ).replace("[expiry_date]", expiry_date)

    assert str(instance) == expected_str
