import { Directive, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';

import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AutocompleteScrollEvent } from '@shared/shared-form/types';

@Directive({
  selector: 'mat-autocomplete[yhtOptionScroll]',
  standalone: true
})
export class OptionsScrollDirective implements OnDestroy {
  @Output('yhtOptionScroll') optionScroll = new EventEmitter<AutocompleteScrollEvent>();

  private scrollSubscription: Subscription;

  constructor(private autocomplete: MatAutocomplete) {
    this.scrollSubscription = this.autocomplete.opened
      .pipe(
        tap(() => {
          setTimeout(() => {
            const panelElement = this.autocomplete.panel?.nativeElement as HTMLElement;
            if (panelElement) {
              panelElement.removeEventListener('scroll', this.scrollListener);
              this.scrollListener = this.scrollListener.bind(this);
              panelElement.addEventListener('scroll', this.scrollListener);
            }
          });
        })
      )
      .subscribe();
  }

  scrollListener(event: Event): void {
    const target = event.target as HTMLElement;
    const offset = 10;
    const atBottom = target.scrollHeight - offset <= Math.ceil(target.scrollTop + target.clientHeight);
    if (atBottom) {
      this.optionScroll.emit({ autoComplete: this.autocomplete, scrollEvent: event });
    }
  }

  ngOnDestroy(): void {
    this.scrollSubscription.unsubscribe();
  }
}
