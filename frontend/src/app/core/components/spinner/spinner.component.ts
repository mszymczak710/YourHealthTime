import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'yht-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() size: 'tiny' | 'small' | 'big' = 'small';
  @Input() visible: boolean;

  getSize(): number {
    switch (this.size) {
      case 'tiny': {
        return 15;
      }
      case 'small': {
        return 25;
      }
      case 'big': {
        return 50;
      }
    }
  }
}
