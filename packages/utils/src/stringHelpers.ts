export type StringMatcherItem = string | RegExp;

export type StringMatcher = StringMatcherItem | StringMatcher[];

export function matchString(value: string, pattern: StringMatcher): boolean {
  if (!pattern) {
    return false;
  }
  if (typeof pattern === 'string') {
    return value === pattern;
  }
  if (Array.isArray(pattern)) {
    return pattern.some((p) => matchString(value, p));
  }
  return pattern.test(value);
}
