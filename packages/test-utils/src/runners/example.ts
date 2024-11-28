import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { ExpectStatic } from '@vitest/expect';
import type { SuiteAPI, TestAPI, OnTestFinishedHandler } from '@vitest/runner';
import { loadScenarios } from '../scenario';
import { vol } from '../fs';
import { withErrorPrefix } from '../error';

export interface ExampleVitestHelpers {
  describe: SuiteAPI;
  expect: ExpectStatic;
  test: TestAPI;
  onTestFinished: (fn: OnTestFinishedHandler) => void;
}

export interface ExampleScenarioData<T> {
  only?: boolean;
  skip?: boolean;
  scenario: T;
  files?: {
    input: Record<string, string>;
    expected: Record<string, string | null>;
  };
}

export interface ExampleScenarioInput<I> {
  only: boolean;
  skip: boolean;
  scenarioPath: string;
  scenario: I;
  files: Record<string, string> | null;
}

export interface ExampleScenarioOutput<O> {
  output: O;
  files: Record<string, string | null> | null;
}

export interface ExampleScenarioHelpers {
  readExampleFile(path: string): string;
  getExampleFilePath(path: string): string;
}

export function loadExampleScenarios<T, I, O>(
  scenariosPath: string,
  options: {
    test?: (filename: string) => boolean;
    loader: (
      data: T,
      files: {
        input: Record<string, string>;
        expected: Record<string, string | null>;
      },
      helpers: ExampleScenarioHelpers,
    ) => {
      input: Pick<ExampleScenarioInput<I>, 'scenario' | 'files'>;
      expected: ExampleScenarioOutput<O>;
    };
    runner: (input: ExampleScenarioInput<I>) => O;
    assert: (expected: O, actual: O, input: I, scenarioPath: string) => void;
    vitest: ExampleVitestHelpers;
  },
): void {
  const { loader, runner, assert, vitest } = options;
  const { describe, expect, test, onTestFinished } = vitest;
  loadScenarios<ExampleScenarioInput<I>, ExampleScenarioOutput<O>>(scenariosPath, {
    describe,
    test: options.test,
    loader: (scenarioPath) => {
      const data = loadJsonFile<ExampleScenarioData<T>>(scenarioPath);
      const {
        only = false,
        skip = false,
        scenario,
        files: filenames = { input: {}, expected: {} },
      } = data;
      const {
        input: { scenario: input, files },
        expected: { output: expectedOutput, files: expectedFiles },
      } = loader(scenario, filenames, {
        getExampleFilePath: (path) => getScenarioFilePath(scenarioPath, path),
        readExampleFile: (path) => loadScenarioFile(scenarioPath, path),
      });
      const inputFiles =
        files && Object.keys(files).length > 0
          ? Object.fromEntries(
              Object.entries(files).map(([path, sourcePath]) => [
                getScenarioFilePath(scenarioPath, path),
                loadScenarioFile(scenarioPath, sourcePath),
              ]),
            )
          : null;
      const outputFiles =
        expectedFiles && Object.keys(expectedFiles).length > 0
          ? Object.fromEntries(
              Object.entries(expectedFiles).map(([path, sourcePath]) => [
                getScenarioFilePath(scenarioPath, path),
                sourcePath && loadScenarioFile(scenarioPath, sourcePath),
              ]),
            )
          : null;
      return {
        input: {
          only,
          skip,
          scenario: input,
          scenarioPath,
          files: inputFiles,
        },
        expected: {
          output: expectedOutput,
          files: outputFiles,
        },
      };
    },
    runner: (input, expected, scenarioPath) => {
      const testFn = input.skip ? test.skip : input.only ? test.only : test;
      testFn('transforms AST correctly', () => {
        if (input.files) vol.fromJSON(input.files);
        onTestFinished(() => {
          vol.reset();
        });
        const output = runner(input);
        const outputFiles = vol.toJSON();
        assert(expected.output, output, input.scenario, scenarioPath);
        withErrorPrefix(input.scenarioPath, () => {
          const files = Object.keys(outputFiles).length === 0 ? null : outputFiles;
          expect(files).toEqual(expected.files);
        });
      });
    },
  });
}

function getScenarioFilePath(scenarioPath: string, filename: string): string {
  return join(dirname(scenarioPath), filename);
}

function loadScenarioFile(scenarioPath: string, filename: string): string {
  try {
    return readFileSync(getScenarioFilePath(scenarioPath, filename), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load scenario file "${filename}" from ${scenarioPath}`, {
      cause: error,
    });
  }
}

function loadJsonFile<T = unknown>(path: string): T {
  const json = readFileSync(path, 'utf-8');
  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`Invalid JSON file: ${path}`);
  }
}
