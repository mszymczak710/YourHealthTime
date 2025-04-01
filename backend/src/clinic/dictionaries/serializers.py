from rest_framework import serializers

from clinic.dictionaries.models import (
    Country,
    Disease,
    Ingredient,
    Medicine,
    MedicineForm,
    MedicineIngredient,
    MedicineType,
    Office,
    OfficeType,
    Specialization,
)


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = "__all__"


class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = "__all__"


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ("name",)


class MedicineTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineType
        fields = ("name",)


class MedicineFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineForm
        fields = ("name",)


class MedicineIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer()

    class Meta:
        model = MedicineIngredient
        fields = ("ingredient", "quantity", "unit")


class MedicineSerializer(serializers.ModelSerializer):
    type_of_medicine = MedicineTypeSerializer()
    form = MedicineFormSerializer()
    active_ingredients = MedicineIngredientSerializer(
        source="medicine_ingredients", many=True
    )

    class Meta:
        model = Medicine
        fields = "__all__"


class MedicineNoFormSerializer(serializers.ModelSerializer):
    type_of_medicine = MedicineTypeSerializer()
    active_ingredients = MedicineIngredientSerializer(
        source="medicine_ingredients", many=True
    )

    class Meta:
        model = Medicine
        fields = ("name", "type_of_medicine", "active_ingredients")


class OfficeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeType
        fields = ("name",)


class OfficeSerializer(serializers.ModelSerializer):
    office_type = OfficeTypeSerializer()

    class Meta:
        model = Office
        fields = "__all__"


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = "__all__"
