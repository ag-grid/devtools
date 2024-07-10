import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    Enum: lib.Enum,
    VARIANT: lib.VARIANT,
    enumConstructor: lib.enumConstructor,
    enumVariantConstructor: lib.enumVariantConstructor,
    instantiateEnum: lib.instantiateEnum,
    isEnumVariant: lib.isEnumVariant,
    match: lib.match,
    nonNull: lib.nonNull,
    partition: lib.partition,
    unreachable: lib.unreachable,
    dynamicRequire: lib.dynamicRequire,
  });
});
