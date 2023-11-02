export function matchString(value: string, pattern: string | RegExp): boolean {
  if (typeof pattern === 'string') return value === pattern;
  return pattern.test(value);
}
