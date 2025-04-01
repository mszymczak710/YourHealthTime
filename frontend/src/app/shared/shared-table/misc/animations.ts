import { animate, state, style, transition, trigger } from '@angular/animations';

export function ExpandableRowAnimation() {
  return trigger('detailExpand', [
    state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
    state('expanded', style({ height: '*' })),
    transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
  ]);
}

export function FiltersToggleExpandAnimation() {
  return trigger('toggleExpand', [
    state('collapsed, void', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
    state('expanded', style({ height: '*', opacity: 1 })),
    transition('collapsed <=> expanded', animate('300ms ease-in-out')),
    transition('expanded <=> void', animate('300ms ease-in-out'))
  ]);
}
