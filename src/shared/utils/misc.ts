import { nanoid } from 'nanoid/non-secure';

export function newId(): string {
  return nanoid(21);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = map.get(key);
    if (group !== undefined) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

export function sortByDate<T extends { date: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date - a.date);
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
