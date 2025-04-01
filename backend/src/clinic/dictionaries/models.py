from django.db import models
from django.utils.translation import gettext_lazy as _

from clinic.models import BaseModel


class Country(BaseModel):
    code = models.CharField(_("code"), max_length=2, unique=True)
    name = models.CharField(_("name"), max_length=100)

    class Meta:
        verbose_name = _("country")
        verbose_name_plural = _("countries")

    def __str__(self):
        return self.name


class Disease(BaseModel):
    name = models.CharField(_("name"), max_length=100, unique=True)

    class Meta:
        verbose_name = _("disease")
        verbose_name_plural = _("diseases")

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    name = models.CharField(_("name"), max_length=50, unique=True)

    class Meta:
        verbose_name = _("ingredient")
        verbose_name_plural = _("ingredients")

    def __str__(self):
        return self.name


class MedicineForm(models.Model):
    name = models.CharField(_("name"), max_length=50, unique=True)

    class Meta:
        verbose_name = _("medicine form")
        verbose_name_plural = _("medicine forms")

    def __str__(self):
        return self.name


class MedicineType(models.Model):
    name = models.CharField(_("name"), max_length=100, unique=True)

    class Meta:
        verbose_name = _("medicine type")
        verbose_name_plural = _("medicine types")

    def __str__(self):
        return self.name


class Medicine(BaseModel):
    name = models.CharField(_("name"), max_length=100, unique=True)
    type_of_medicine = models.ForeignKey(
        MedicineType,
        on_delete=models.PROTECT,
        related_name="medicines",
        verbose_name=_("type of medicine"),
    )
    form = models.ForeignKey(
        MedicineForm, on_delete=models.PROTECT, verbose_name=_("form")
    )
    active_ingredients = models.ManyToManyField(
        Ingredient,
        through="MedicineIngredient",
        verbose_name=_("active ingredients"),
    )

    class Meta:
        verbose_name = _("medicine")
        verbose_name_plural = _("medicines")

    def __str__(self):
        active_ingredients = self.active_ingredients.through.objects.filter(
            medicine=self
        )
        ingredients_str = ", ".join(
            [
                f"{ing.ingredient.name} {ing.quantity} {ing.unit}"
                for ing in active_ingredients
            ]
        )
        return f"{self.name} ({ingredients_str})"


class MedicineIngredient(models.Model):
    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT,
        related_name="medicine_ingredients",
        verbose_name=_("medicine"),
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.PROTECT,
        related_name="medicine_ingredients",
        verbose_name=_("ingredient"),
    )
    quantity = models.DecimalField(
        _("quantity"), max_digits=9, decimal_places=3
    )
    unit = models.CharField(_("unit"), max_length=10)

    class Meta:
        verbose_name = _("medicine ingredient")
        verbose_name_plural = _("medicine ingredients")

    def __str__(self):
        return f"{self.medicine.name} - {self.ingredient.name}: {self.quantity} {self.unit}"


class OfficeType(models.Model):
    name = models.CharField(_("name"), max_length=100, unique=True)

    class Meta:
        verbose_name = _("office type")
        verbose_name_plural = _("office types")

    def __str__(self):
        return self.name


class Office(BaseModel):
    office_type = models.ForeignKey(
        OfficeType,
        on_delete=models.PROTECT,
        related_name="offices",
        verbose_name=_("room type"),
    )
    floor = models.IntegerField(_("floor"))
    room_number = models.IntegerField(_("room number"))

    class Meta:
        verbose_name = _("office")
        verbose_name_plural = _("offices")

    def __str__(self):
        return f"{self.office_type} (Floor: {self.floor}, Room number: {self.room_number})"


class Specialization(BaseModel):
    name = models.CharField(_("name"), max_length=100, unique=True)

    class Meta:
        verbose_name = _("specialization")
        verbose_name_plural = _("specializations")

    def __str__(self):
        return self.name
