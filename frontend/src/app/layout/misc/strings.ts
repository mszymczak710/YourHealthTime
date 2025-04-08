import { dashboardStrings } from '@layout/misc/dashboard-strings';
import { menuStrings } from '@layout/misc/menu-strings';
import { noPermissionsStrings } from '@layout/misc/no-permissions-strings';
import { pageNotFoundStrings } from '@layout/misc/page-not-found-strings';
import { sessionTimerStrings } from '@layout/misc/session-timer-strings';

export const strings = Object.freeze({
  dashboard: dashboardStrings.dashboard,
  errorOccurred: 'Wystąpił błąd aplikacji. Odśwież stronę ponownie',
  menu: menuStrings.menu,
  noPermissions: noPermissionsStrings.noPermissions,
  pageNotFound: pageNotFoundStrings.pageNotFound,
  sessionTimer: sessionTimerStrings.sessionTimer
});

export type LayoutStrings = typeof strings;
