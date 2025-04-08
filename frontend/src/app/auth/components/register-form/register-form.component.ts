import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import { StringsLoader } from '@auth/misc';
import { AuthFacade } from '@auth/services';
import { RegisterRequestData } from '@auth/types';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';
import { ListParams } from '@core/types';
import { CustomValidators } from '@core/validators';

import { CountriesDataService, CountriesFacade } from '@dictionaries/countries/services';
import { Country } from '@dictionaries/countries/types';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { DialogFormCanDeactivate, FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldAutocompleteData, FormFields, FormFieldTypes } from '@shared/shared-form/types';

export interface RegisterFormComponent extends DialogFormCanDeactivate<RegisterFormComponent, void>, FormComponentBase, StringsLoader {}

@Component({
  selector: 'yht-register-form',
  standalone: true,
  imports: [
    CommonModule,
    FormFieldSwitcherComponent,
    MatButtonModule,
    MatDialogModule,
    MatStepperModule,
    ReactiveFormsModule,
    SpinnerComponent
  ],
  templateUrl: './register-form.component.html',
  providers: [CountriesDataService, CountriesFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([DialogFormCanDeactivate, StringsLoader])
export class RegisterFormComponent extends FormComponentBase implements OnInit, AfterViewInit {
  @ViewChild(MatStepper) stepper: MatStepper;

  readonly addressFieldNames = ['street', 'house_number', 'apartment_number', 'post_code', 'city', 'country'];
  readonly fieldNames = ['first_name', 'last_name', 'email', 'password', 'password_confirm', 'pesel', 'phone_number'];
  addressFields: FormFields;

  get addressForm(): UntypedFormGroup {
    return this.form.get('address') as UntypedFormGroup;
  }

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected dialogRef: MatDialogRef<RegisterFormComponent, void>,
    private authFacade: AuthFacade,
    private countriesFacade: CountriesFacade,
    private toastService: ToastService
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-lg');
    this.handleClose();
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  private initForm(): void {
    this.prepareFields();
    this.prepareAddressFields();
    this.prepareForm();
    this.addGroupToForm('address', this.addressFields);
  }

  private prepareFields(): void {
    const idPrefix = 'register-form';
    this.fields = new Map<string, FormField>([
      [
        'first_name',
        {
          idPrefix,
          label: this.strings.register.fields.first_name.label,
          name: 'first_name',
          placeholder: this.strings.register.fields.first_name.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.firstName]
        }
      ],
      [
        'last_name',
        {
          idPrefix,
          label: this.strings.register.fields.last_name.label,
          name: 'last_name',
          placeholder: this.strings.register.fields.last_name.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.lastName]
        }
      ],
      [
        'email',
        {
          idPrefix,
          label: this.strings.register.fields.email.label,
          name: 'email',
          placeholder: this.strings.register.fields.email.placeholder,
          required: true,
          type: FormFieldTypes.EMAIL,
          validators: [Validators.email]
        }
      ],
      [
        'password',
        {
          idPrefix,
          label: this.strings.register.fields.password.label,
          name: 'password',
          placeholder: this.strings.register.fields.password.placeholder,
          required: true,
          type: FormFieldTypes.PASSWORD
        }
      ],
      [
        'password_confirm',
        {
          idPrefix,
          label: this.strings.register.fields.password_confirm.label,
          name: 'password_confirm',
          placeholder: this.strings.register.fields.password_confirm.placeholder,
          required: true,
          type: FormFieldTypes.PASSWORD
        }
      ],
      [
        'pesel',
        {
          idPrefix,
          label: this.strings.register.fields.pesel.label,
          name: 'pesel',
          placeholder: this.strings.register.fields.pesel.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.pesel]
        }
      ],
      [
        'phone_number',
        {
          idPrefix,
          label: this.strings.register.fields.phone_number.label,
          name: 'phone_number',
          placeholder: this.strings.register.fields.phone_number.placeholder,
          required: true,
          type: FormFieldTypes.PHONE,
          validators: [CustomValidators.phoneNumber]
        }
      ],
      [
        'recaptcha_response',
        {
          idPrefix,
          name: 'recaptcha_response',
          required: true,
          type: FormFieldTypes.RECAPTCHA
        }
      ]
    ]);
  }

  private prepareAddressFields(): void {
    const idPrefix = 'register-form-address';
    this.addressFields = new Map<string, FormField>([
      [
        'street',
        {
          idPrefix,
          label: this.strings.register.fields.address.street.label,
          name: 'street',
          placeholder: this.strings.register.fields.address.street.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.street]
        }
      ],
      [
        'house_number',
        {
          idPrefix,
          label: this.strings.register.fields.address.house_number.label,
          name: 'house_number',
          placeholder: this.strings.register.fields.address.house_number.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.houseNumber]
        }
      ],
      [
        'apartment_number',
        {
          idPrefix,
          label: this.strings.register.fields.address.apartment_number.label,
          name: 'apartment_number',
          placeholder: this.strings.register.fields.address.apartment_number.placeholder,
          required: false,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.apartmentNumber]
        }
      ],
      [
        'post_code',
        {
          idPrefix,
          label: this.strings.register.fields.address.post_code.label,
          name: 'post_code',
          placeholder: this.strings.register.fields.address.post_code.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.postCode]
        }
      ],
      [
        'city',
        {
          idPrefix,
          label: this.strings.register.fields.address.city.label,
          name: 'city',
          placeholder: this.strings.register.fields.address.city.placeholder,
          required: true,
          type: FormFieldTypes.INPUT,
          validators: [CustomValidators.city]
        }
      ],
      [
        'country',
        {
          data: {
            dataSourceFn: (params: ListParams) => this.countriesFacade.getCountries(params),
            optionLabelKey: 'name',
            optionValueKey: 'id'
          } as FormFieldAutocompleteData<Country>,
          idPrefix,
          label: this.strings.register.fields.address.country.label,
          name: 'country',
          placeholder: this.strings.register.fields.address.country.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ]
    ]);
  }

  getFieldCssClass(fieldName: string): string {
    switch (fieldName) {
      case 'apartment_number':
      case 'house_number':
        return 'col-3';
      case 'first_name':
      case 'last_name':
      case 'email':
      case 'post_code':
        return 'col-4';
      case 'city':
        return 'col-8';
      case 'country':
      case 'recaptcha_response':
        return 'col-12';
      default:
        return 'col-6';
    }
  }

  isPreviousButtonVisible(): boolean {
    return this.stepper.selectedIndex > 0;
  }

  isNextButtonVisible(): boolean {
    return this.stepper.selectedIndex < this.stepper.steps.length - 1;
  }

  onPreviousButtonClick(): void {
    this.stepper.previous();
  }

  onNextButtonClick(): void {
    this.stepper.next();
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    const formData = this.form.value;

    const data: RegisterRequestData = {
      ...formData,
      address: {
        ...formData.address,
        country: formData.address.country.id
      }
    };
    this.authFacade.register(data).subscribe({
      next: () => {
        this.dialogRef.close();
        this.toastService.showSuccessMessage(this.strings.register.succeed);
      },
      error: error => {
        this.handleError(error);
      }
    });
  }
}
