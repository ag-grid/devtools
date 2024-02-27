import { expect, test } from 'vitest';

import * as lib from './lib';

const versions: Array<string> = ['31.0.0'];

test('module exports', () => {
  expect({ ...lib }).toEqual({
    default: {
      name: expect.any(String),
      versions: versions.map((version) => versionManifest(version)),
    },
  });
});

function versionManifest(version: string): object {
  return {
    version,
    codemodPath: `version/${version}/codemod.cjs`,
    workerPath: `version/${version}/worker.cjs`,
    transforms: expect.arrayContaining([
      {
        description: expect.any(String),
        name: expect.any(String),
      },
    ]),
  };
}