import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@visits/misc';

export interface VisitNotesRowComponent extends StringsLoader {}

@Component({
  selector: 'yht-visit-notes-row',
  standalone: true,
  imports: [],
  templateUrl: './visit-notes-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class VisitNotesRowComponent {
  @Input() notes: string;
}
