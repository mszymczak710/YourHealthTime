import pytest


@pytest.mark.parametrize(
    "instances, expected_str",
    (
        ("country_instances", "Polska"),
        ("disease_instances", "Depresja"),
        ("ingredient_instances", "Lewotyroksyna sodowa"),
        (
            "office_instances",
            "Gabinet medycyny rodzinnej (Floor: 1, Room number: 101)",
        ),
        ("medicine_instances", "Euthyrox (Lewotyroksyna sodowa 100.000 mcg)"),
        ("specialization_instances", "Kardiologia"),
    ),
)
def test_clinic_models_str_representation(request, instances, expected_str):
    instance_list = request.getfixturevalue(instances)
    instance = instance_list[0]
    assert str(instance) == expected_str
