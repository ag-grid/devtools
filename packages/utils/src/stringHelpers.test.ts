import { describe, expect, test } from 'vitest';

import { matchString, matchImport } from './stringHelpers';

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

  test('handle arrays of regex and strings', () => {
    expect(matchString('foo', ['foo', [/bar/]])).toBe(true);
    expect(matchString('xxx', ['foo', /bar/])).toBe(false);
    expect(matchString('bar', [['foo'], /bar/])).toBe(true);
    expect(matchString('foo', ['foo', /baz/])).toBe(true);
    expect(matchString('foo', ['f', /baz/])).toBe(false);
  });
});

describe(matchImport, () => {
  test('matches exact import', () => {
    expect(matchImport('foo', 'foo')).toBe(true);
    expect(matchImport('foo', 'bar')).toBe(false);
  });

  test('matches import with added extensions', () => {
    expect(matchImport('foo.ts', 'foo')).toBe(true);
    expect(matchImport('foo.js', 'foo')).toBe(true);
    expect(matchImport('foo.tsx', 'foo')).toBe(true);
    expect(matchImport('foo.jsx', 'foo')).toBe(true);
    expect(matchImport('foo.ts', 'bar')).toBe(false);
    expect(matchImport('foo.js', 'bar')).toBe(false);
    expect(matchImport('foo.tsx', 'bar')).toBe(false);
    expect(matchImport('foo.jsx', 'bar')).toBe(false);
  });

  test('matches import with regex pattern', () => {
    expect(matchImport('foo', /foo|bar/)).toBe(true);
    expect(matchImport('foo', /baz/)).toBe(false);
  });

  test('handle arrays of regex and strings', () => {
    expect(matchImport('foo', ['foo', [/bar/]])).toBe(true);
    expect(matchImport('xxx', ['foo', /bar/])).toBe(false);
    expect(matchImport('bar', [['foo'], /bar/])).toBe(true);
    expect(matchImport('foo', ['foo', /baz/])).toBe(true);
    expect(matchImport('foo', ['f', /baz/])).toBe(false);
  });
});
