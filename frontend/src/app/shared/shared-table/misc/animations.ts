import { animate, state, style, transition, trigger } from '@angular/animations';

export function ExpandableRowAnimation() {
  return trigger('detailExpand', [
    state('collapsed', style({ height: '0px', minHeight: '0' })),
    state('expanded', style({ height: '*' })),
    transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
  ]);
}

export function FiltersToggleExpandAnimation() {
  return trigger('toggleExpand', [
    state('collapsed', style({ height: '0px', minHeight: '0' })),
    state('expanded', style({ height: '*' })),
    transition('expanded <=> collapsed', animate('300ms ease-in-out'))
  ]);
}
