import { strings } from '@roles/doctors/misc';

import { FormField, FormFieldTypes, FormFields } from '@shared/shared-form/types';

export class DoctorHelper {
  static prepareFields(idPrefix: string): FormFields {
    return new Map<string, FormField>([
      [
        'job_execution_number',
        {
          idPrefix,
          label: strings.form.fields.job_execution_number.label,
          name: 'job_execution_number',
          type: FormFieldTypes.INPUT
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
}
