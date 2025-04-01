import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nestedValuePipe',
  standalone: true
})
export class NestedValuePipe implements PipeTransform {
  transform(value: any, backendName: string): any {
    if (!value || !backendName) {
      return null;
    }

    return backendName.split('__').reduce((acc, key) => acc?.[key], value);
  }
}
