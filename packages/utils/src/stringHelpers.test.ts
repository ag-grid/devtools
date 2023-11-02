import { describe, expect, test } from 'vitest';

import { matchString } from './stringHelpers';

describe(matchString, () => {
  test('matches plain string patterns', () => {
    expect(matchString('foo', 'foo')).toBe(true);
    expect(matchString('foo', 'f')).toBe(false);
    expect(matchString('foo', 'oo')).toBe(false);
  });

  test('matches regular expression patterns', () => {
    expect(matchString('foo', /foo|bar/)).toBe(true);
    expect(matchString('foo', /oo/)).toBe(true);
    expect(matchString('foo', /baz/)).toBe(false);
  });
});
