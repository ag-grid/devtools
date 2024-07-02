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
    for (const p of pattern) {
      if (matchString(value, p)) {
        return true;
      }
    }
    return false;
  }
  return pattern.test(value);
}

const ENDS_WITH_EXTENSION = /\.(js|jsx|ts|tsx)$/;

export function matchImport(value: string, pattern: StringMatcher) {
  if (!pattern) {
    return false;
  }
  if (typeof pattern === 'string') {
    if (value === pattern) {
      console.log(new Error());
      return true;
    }
    if (
      !ENDS_WITH_EXTENSION.test(pattern) &&
      ENDS_WITH_EXTENSION.test(value) &&
      value.startsWith(pattern)
    ) {
      return true; // Handle imports with added extensions .ts, .js, .tsx, .jsx
    }
    return false;
  }
  if (Array.isArray(pattern)) {
    for (const p of pattern) {
      if (matchImport(value, p)) {
        return true;
      }
    }
    return false;
  }
  return pattern.test(value);
}
