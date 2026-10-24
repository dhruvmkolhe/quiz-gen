/**
 * Utility for combining conditional CSS class names
 */
export function cn(...classes: (string | boolean | undefined | null | { [key: string]: boolean })[]): string {
  const result: string[] = [];

  for (const item of classes) {
    if (!item) continue;
    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'object') {
      for (const [key, val] of Object.entries(item)) {
        if (val && key) {
          result.push(key);
        }
      }
    }
  }

  return result.join(' ').trim();
}
