import { Pipe, PipeTransform } from '@angular/core';

/**
 * Count matches pipe
 * Returns the count of items in an array
 * Usage: array | countMatches
 */
@Pipe({
  name: 'countMatches',
  standalone: true
})
export class CountMatchesPipe implements PipeTransform {
  transform<T>(items: T[]): number {
    if (!items) {
      return 0;
    }
    return items.length;
  }
}
