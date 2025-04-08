import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { sprintf } from 'sprintf-js';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@prescriptions/misc';
import { Dosage } from '@prescriptions/types';

export interface PrescriptionDosagesRowComponent extends StringsLoader {}

@Component({
  selector: 'yht-prescription-dosages-row',
  standalone: true,
  imports: [],
  templateUrl: './prescription-dosages-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class PrescriptionDosagesRowComponent {
  @Input() dosages: Dosage[];

  getDosageInfo(dosage: Dosage) {
    return sprintf(this.strings.dosageDetail, dosage.medicine.name, dosage.amount, dosage.form.name, dosage.frequency);
  }
}
