import { Observable } from 'rxjs';

export interface ConfirmDialogData {
  cancelLabel: string;
  confirmLabel: string;
  content: string;
  onConfirm: () => Observable<unknown>;
  successMessage: string;
  title: string;
}
