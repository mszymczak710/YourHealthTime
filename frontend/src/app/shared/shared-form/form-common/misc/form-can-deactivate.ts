import { hasModifierKey } from '@angular/cdk/keycodes';
import { Directive, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { filter, firstValueFrom, Observable } from 'rxjs';

import { commonStrings } from '@core/misc';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Directive()
export class FormCanDeactivate implements ComponentCanDeactivate {
  canDeactivate(): boolean | Observable<boolean> {
    return true;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): BeforeUnloadEvent {
    if (!this.canDeactivate()) {
      event.returnValue = 'Unsaved';
    }
    return event;
  }
}

export abstract class DialogFormCanDeactivate<ComponentType, ReturnType> implements ComponentCanDeactivate {
  protected dialogRef: MatDialogRef<ComponentType, ReturnType>;
  abstract canDeactivate(): boolean | Observable<boolean>;

  protected handleClose(): void {
    this.dialogRef.disableClose = true;

    const escapeKeyPressed = (event: KeyboardEvent) => (['Escape', 'Esc'] as string[]).includes(event.code);
    this.dialogRef
      .keydownEvents()
      .pipe(filter(event => escapeKeyPressed(event) && !hasModifierKey(event)))
      .subscribe({
        next: (event: KeyboardEvent) => {
          event.preventDefault();
          this.closeAfterConfirm();
        }
      });

    // podpięcie listenera na kliknięcie w backdrop
    this.dialogRef.backdropClick().subscribe({
      next: () => {
        this.closeAfterConfirm();
      }
    });
  }

  protected async closeAfterConfirm(dialogResult: ReturnType = this.getDialogResult()): Promise<void> {
    const canDeactivate = this.canDeactivate();
    let canBeClosed: boolean;
    if (typeof canDeactivate === 'boolean') {
      canBeClosed = canDeactivate;
    } else {
      canBeClosed = await firstValueFrom(this.canDeactivate() as Observable<boolean>);
    }
    if (canBeClosed || confirm(commonStrings.exitUnsaved)) {
      this.dialogRef.close(dialogResult);
    }
  }

  protected getDialogResult(): ReturnType {
    return;
  }
}
