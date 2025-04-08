import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { Subscription } from 'rxjs';
import { AuthFacade } from 'src/app/auth/services';
import { UserRole } from 'src/app/auth/types';

@Directive({
  selector: '[yhtPermission]',
  standalone: true
})
export class PermissionStructuralDirective implements OnInit, OnDestroy {
  @Input('yhtPermission') roles: UserRole[] | null = null;
  private hasView = false;
  private subscription = new Subscription();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authFacade: AuthFacade
  ) {}

  ngOnInit(): void {
    const userSubscription = this.authFacade.user$.subscribe(user => {
      this.updateView(user?.role ?? null);
    });
    this.subscription.add(userSubscription);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(userRole: UserRole | null = null): void {
    const hasAccess = this.roles?.length ? this.roles.includes(userRole as UserRole) : userRole === null;

    if (hasAccess && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasAccess && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
