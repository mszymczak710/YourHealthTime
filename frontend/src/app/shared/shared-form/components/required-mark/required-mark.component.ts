import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'yht-required-mark',
  standalone: true,
  imports: [],
  templateUrl: './required-mark.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequiredMarkComponent {
  @Input() readonly: boolean;
  @Input() required: boolean;
}
