import { Pipe, PipeTransform } from '@angular/core';

/**
 * Filter pipe for arrays
 * Usage: array | filter: 'propertyName'
 */
@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform<T>(items: T[], property: keyof T, value?: any): T[] {
    if (!items) {
      return items;
    }

    if (!property) {
      return items;
    }

    // If no value specified, filter for truthy values
    if (value === undefined) {
      return items.filter(item => !!item[property]);
    }

    // Filter for items matching the specified value
    return items.filter(item => item[property] === value);
  }
}
