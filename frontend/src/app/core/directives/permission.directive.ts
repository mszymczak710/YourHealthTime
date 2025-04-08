import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

import { Subscription } from 'rxjs';
import { AuthFacade } from 'src/app/auth/services';
import { UserRole } from 'src/app/auth/types';

import { commonStrings } from '@core/misc';

@Directive({
  selector: '[yhtPermissionDisabled]',
  standalone: true,
  providers: [MatTooltip]
})
export class PermissionDirective implements AfterViewInit, OnDestroy {
  @Input('yhtPermissionDisabled') roles: UserRole[] | null = null;

  private wrapper: HTMLElement | null = null;
  private subscriptions = new Subscription();

  constructor(
    private authFacade: AuthFacade,
    private elRef: ElementRef,
    private matTooltip: MatTooltip,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const userSubscription = this.authFacade.user$.subscribe(user => {
      const userRole = user?.role ?? null;
      this.checkPermission(userRole);
    });
    this.subscriptions.add(userSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
    this.removeWrapperIfExists();
    this.matTooltip.hide();
  }

  private checkPermission(userRole: UserRole | null): void {
    const element = this.elRef.nativeElement as HTMLElement;
    const isMenuItem = element.classList.contains('mat-mdc-menu-item');
    const hasAccess = this.roles?.length ? this.roles.includes(userRole as UserRole) : userRole === null;

    this.removeWrapperIfExists();

    if (hasAccess) {
      return;
    }

    if (isMenuItem) {
      this.renderer.setProperty(element, 'disabled', true);
      this.renderer.setStyle(element, 'cursor', 'not-allowed');
      this.renderer.setAttribute(element, 'tabindex', '-1');
      this.attachTooltipListeners(element);
    } else {
      this.wrapper = this.renderer.createElement('div');
      this.renderer.addClass(this.wrapper, 'element-disabled-wrapper');
      this.renderer.addClass(element, 'mat-mdc-button-disabled');
      this.renderer.setAttribute(element, 'tabindex', '-1');

      const parent = element.parentNode;
      if (parent) {
        parent.insertBefore(this.wrapper, element);
        this.wrapper.appendChild(element);
        this.attachTooltipListeners(this.wrapper);
      }
    }
  }

  private attachTooltipListeners(target: HTMLElement): void {
    this.subscriptions.add(
      this.renderer.listen(target, 'mouseover', () => {
        this.matTooltip.message = commonStrings.permissionDenied;
        this.matTooltip.show();
      })
    );
    this.subscriptions.add(
      this.renderer.listen(target, 'mouseleave', () => {
        this.matTooltip.hide();
      })
    );
  }

  private removeWrapperIfExists(): void {
    const element = this.elRef.nativeElement as HTMLElement;
    const isMenuItem = element.classList.contains('mat-mdc-menu-item');

    if (isMenuItem) {
      this.renderer.setProperty(element, 'disabled', false);
      this.renderer.removeStyle(element, 'cursor');
      this.renderer.removeAttribute(element, 'tabindex');
    }

    if (this.wrapper) {
      const parent = this.wrapper.parentNode;
      if (parent) {
        parent.insertBefore(element, this.wrapper);
        parent.removeChild(this.wrapper);
      }
      this.renderer.removeClass(element, 'mat-mdc-button-disabled');
      this.renderer.removeAttribute(element, 'tabindex');
      this.wrapper = null;
    }
  }
}
