import { ListParams } from '@core/types';
import { CustomValidators } from '@core/validators';

import { CountriesFacade } from '@dictionaries/countries/services';
import { Country } from '@dictionaries/countries/types';

import { strings } from '@roles/patients/misc/strings';
import { Gender } from '@roles/patients/types';

import { FormField, FormFieldAutocompleteData, FormFieldSelectData, FormFieldTypes, FormFields } from '@shared/shared-form/types';

export class PatientHelper {
  static prepareFields(idPrefix: string): FormFields {
    return new Map<string, FormField>([
      [
        'pesel',
        {
          idPrefix,
          label: strings.form.fields.pesel.label,
          name: 'pesel',
          type: FormFieldTypes.INPUT
        }
      ],
      [
        'birth_date',
        {
          idPrefix,
          label: strings.form.fields.birth_date.label,
          name: 'birth_date',
          type: FormFieldTypes.DATE
        }
      ],
      [
        'gender',
        {
          data: {
            options: [Gender.FEMALE, Gender.MALE].map(value => ({
              label: strings.form.fields.gender.options[value],
              value
            }))
          } as FormFieldSelectData,
          idPrefix,
          label: strings.form.fields.gender.label,
          name: 'gender',
          type: FormFieldTypes.SELECT
        }
      ],
      [
        'phone_number',
        {
          idPrefix,
          label: strings.form.fields.phone_number.label,
          name: 'phone_number',
          placeholder: strings.form.fields.phone_number.placeholder,
          required: true,
          type: FormFieldTypes.PHONE,
          validators: [CustomValidators.phoneNumber]
        }
      ]
    ]);
  }

  static prepareUserFields(idPrefix: string): FormFields {
    idPrefix = `${idPrefix}-user`;
    return new Map<string, FormField>([
      [
        'first_name',
        {
          idPrefix,
          label: strings.form.fields.user.first_name.label,
          name: 'first_name',
          type: FormFieldTypes.INPUT
        }
      ],
      [
        'last_name',
        {
          idPrefix,
          label: strings.form.fields.user.last_name.label,
          name: 'last_name',
          type: FormFieldTypes.INPUT
        }
      ],
      [
        'email',
        {
          idPrefix,
          label: strings.form.fields.user.email.label,
          name: 'email',
          type: FormFieldTypes.EMAIL
        }
      ]
    ]);
  }

  static prepareAddressFields(idPrefix: string, countriesFacade: CountriesFacade): FormFields {
    idPrefix = `${idPrefix}-address`;
    return new Map<string, FormField>([
      [
        'street',
        {
          idPrefix,
          label: strings.form.fields.address.street.label,
          name: 'street',
          placeholder: strings.form.fields.address.street.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.street]
        }
      ],
      [
        'house_number',
        {
          idPrefix,
          label: strings.form.fields.address.house_number.label,
          name: 'house_number',
          placeholder: strings.form.fields.address.house_number.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.houseNumber]
        }
      ],
      [
        'apartment_number',
        {
          idPrefix,
          label: strings.form.fields.address.apartment_number.label,
          name: 'apartment_number',
          placeholder: strings.form.fields.address.apartment_number.placeholder,
          required: false,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.apartmentNumber]
        }
      ],
      [
        'post_code',
        {
          idPrefix,
          label: strings.form.fields.address.post_code.label,
          name: 'post_code',
          placeholder: strings.form.fields.address.post_code.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.postCode]
        }
      ],
      [
        'city',
        {
          idPrefix,
          label: strings.form.fields.address.city.label,
          name: 'city',
          placeholder: strings.form.fields.address.city.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.city]
        }
      ],
      [
        'country',
        {
          data: {
            dataSourceFn: (params: ListParams) => countriesFacade.getCountries(params),
            optionLabelKey: 'name',
            optionValueKey: 'id'
          } as FormFieldAutocompleteData<Country>,
          idPrefix,
          label: strings.form.fields.address.country.label,
          name: 'country',
          placeholder: strings.form.fields.address.country.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ]
    ]);
  }
}
