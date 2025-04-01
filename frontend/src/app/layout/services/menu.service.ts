import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';

import { UserRole } from 'src/app/auth/types';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@layout/misc';
import { MenuItem } from '@layout/types';

export interface MenuService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class MenuService {
  constructor(private router: Router) {}

  getMenuConfig(): MenuItem[] {
    const menu: MenuItem[] = [
      {
        label: this.strings.menu.visits,
        routerLink: ['/wizyty']
      },
      {
        label: this.strings.menu.prescriptions,
        routerLink: ['/recepty']
      },
      {
        label: this.strings.menu.dictionaries.label,
        roles: undefined,
        children: [
          {
            label: this.strings.menu.dictionaries.group.diseases,
            routerLink: ['/slowniki/choroby']
          },
          {
            label: this.strings.menu.dictionaries.group.countries,
            roles: undefined,
            routerLink: ['/slowniki/kraje']
          },
          {
            label: this.strings.menu.dictionaries.group.medicines,
            routerLink: ['/slowniki/leki']
          },
          {
            label: this.strings.menu.dictionaries.group.offices,
            routerLink: ['/slowniki/gabinety']
          },
          {
            label: this.strings.menu.dictionaries.group.specializations,
            routerLink: ['/slowniki/specjalizacje']
          }
        ]
      },
      {
        label: this.strings.menu.roles.label,
        roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE],
        children: [
          {
            label: this.strings.menu.roles.group.doctors,
            routerLink: ['/uzytkownicy/lekarze']
          },
          {
            label: this.strings.menu.roles.group.patients,
            routerLink: ['/uzytkownicy/pacjenci']
          },
          {
            label: this.strings.menu.roles.group.nurses,
            routerLink: ['/uzytkownicy/pielegniarki']
          }
        ]
      }
    ];

    return this.addRolesFromRouting(menu);
  }

  private addRolesFromRouting(menu: MenuItem[]): MenuItem[] {
    return menu.map(item => {
      const newItem = { ...item };

      if (newItem.routerLink && !newItem.roles) {
        const routePath = this.getRouterLinkPath(newItem.routerLink);
        const matchingRoute = this.findRouteByPath(this.router.config, routePath);
        newItem.roles = matchingRoute?.data?.roles ?? undefined;
      }

      if (newItem.children?.length) {
        newItem.children = this.addRolesFromRouting(newItem.children);
      }

      return newItem;
    });
  }

  private getRouterLinkPath(routerLink: string | any[]): string {
    return Array.isArray(routerLink) ? routerLink[0] : routerLink;
  }

  private findRouteByPath(routes: Route[], fullPath: string, currentPath = ''): Route | undefined {
    for (const route of routes) {
      const combinedPath = [currentPath, route.path].filter(Boolean).join('/');

      if (combinedPath === fullPath.replace(/^\//, '')) {
        return route;
      }

      if (route.children?.length) {
        const childMatch = this.findRouteByPath(route.children, fullPath, combinedPath);
        if (childMatch) {
          return childMatch;
        }
      }
    }

    return undefined;
  }
}
