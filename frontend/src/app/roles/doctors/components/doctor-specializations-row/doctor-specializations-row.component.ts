import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { Specialization } from '@dictionaries/specializations/types';

import { StringsLoader } from '@roles/doctors/misc';

export interface DoctorSpecializationsRowComponent extends StringsLoader {}

@Component({
  selector: 'yht-doctor-specializations-row',
  standalone: true,
  imports: [],
  templateUrl: './doctor-specializations-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class DoctorSpecializationsRowComponent {
  @Input() specializations: Specialization[];
}
