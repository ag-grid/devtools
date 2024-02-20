import { loadJsonFile, loadScenarios, vol } from '@ag-grid-devtools/test-utils';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, expect, onTestFinished, test } from 'vitest';

export interface CodemodExampleScenarioData {
  only?: boolean;
  skip?: boolean;
  input: string;
  output: string | null;
  errors: string | null;
  files?: {
    input: Record<string, string>;
    expected: Record<string, string>;
  };
  options?: Record<string, unknown> & {
    lineEndings?: LineEndingsMode | unknown;
  };
}

export interface CodemodExampleScenarioInput {
  only: boolean;
  skip: boolean;
  path: string;
  source: string;
  scenarioPath: string;
  errorsPath: string | null;
  fs: Record<string, string> | null;
  options: {
    applyDangerousEdits: boolean;
  };
}

export interface CodemodExampleScenarioOutput {
  source: string | null;
  errors: Array<Error>;
  fs: Record<string, string | null> | null;
}

export function loadExampleScenarios(
  scenariosPath: string,
  options: {
    runner: (input: CodemodExampleScenarioInput) => Omit<CodemodExampleScenarioOutput, 'fs'>;
  },
): void {
  const { runner } = options;
  loadScenarios<CodemodExampleScenarioInput, CodemodExampleScenarioOutput>(scenariosPath, {
    describe,
    loader: (scenarioPath) => {
      const scenario = loadJsonFile<CodemodExampleScenarioData>(scenarioPath);
      const { only = false, skip = false, input, output, errors, files, options } = scenario;
      const lineEndings = options?.lineEndings;
      if (!isValidLineEndingsModeOption(lineEndings)) {
        throw new Error(`Invalid line endings mode: ${lineEndings}`);
      }
      const { transformInput, transformExpected } = {
        transformInput: lineEndings
          ? transformScenarioInputLineEndings.bind(null, lineEndings)
          : identity,
        transformExpected: lineEndings
          ? transformScenarioOutputLineEndings.bind(null, lineEndings)
          : identity,
      };
      const inputPath = getScenarioFilePath(scenarioPath, input);
      const inputSource = loadScenarioFile(scenarioPath, input);
      const inputFs =
        files && Object.keys(files.input).length > 0
          ? Object.fromEntries(
              Object.entries(files.input).map(([path, sourcePath]) => [
                getScenarioFilePath(scenarioPath, path),
                loadScenarioFile(scenarioPath, sourcePath),
              ]),
            )
          : null;
      const errorsPath = errors == null ? null : getScenarioFilePath(scenarioPath, errors);
      const outputSource = output == null ? null : loadScenarioFile(scenarioPath, output);
      const outputErrors = errorsPath == null ? [] : require(errorsPath);
      const outputFs =
        files && Object.keys(files.expected).length > 0
          ? Object.fromEntries(
              Object.entries(files.expected).map(([path, sourcePath]) => [
                getScenarioFilePath(scenarioPath, path),
                loadScenarioFile(scenarioPath, sourcePath),
              ]),
            )
          : null;
      const applyDangerousEdits = Boolean(options?.applyDangerousEdits);
      return {
        input: transformInput({
          only,
          skip,
          path: inputPath,
          source: inputSource,
          scenarioPath,
          errorsPath,
          fs: inputFs,
          options: {
            applyDangerousEdits,
          },
        }),
        expected: transformExpected({
          source: outputSource === inputSource ? null : outputSource,
          errors: outputErrors,
          fs: outputFs,
        }),
      };
    },
    runner: (input, expected) => {
      const testFn = input.skip ? test.skip : input.only ? test.only : test;
      testFn('transforms AST correctly', () => {
        if (input.fs) vol.fromJSON(input.fs);
        onTestFinished(() => {
          vol.reset();
        });
        const output = runner(input);
        const outputFs = vol.toJSON();
        withErrorPrefix(input.path, () => {
          expect(output.source).toEqual(expected.source);
        });
        withErrorPrefix(input.errorsPath ?? input.scenarioPath, () => {
          expect(output.errors).toEqual(expected.errors);
        });
        withErrorPrefix(input.scenarioPath, () => {
          const fs = Object.keys(outputFs).length === 0 ? null : outputFs;
          expect(fs).toEqual(expected.fs);
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

function withErrorPrefix<T>(prefix: string, fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      error.message = `${prefix}\n\n${error.message}`;
    }
    throw error;
  }
}

function transformScenarioInputLineEndings(
  lineEndings: LineEndingsMode,
  scenario: CodemodExampleScenarioInput,
): CodemodExampleScenarioInput {
  return {
    ...scenario,
    source: scenario.source && transformLineEndings(scenario.source, lineEndings),
    fs:
      scenario.fs &&
      Object.fromEntries(
        Object.entries(scenario.fs).map(([path, content]) => [
          path,
          transformLineEndings(content, lineEndings),
        ]),
      ),
  };
}

function transformScenarioOutputLineEndings(
  lineEndings: LineEndingsMode,
  scenario: CodemodExampleScenarioOutput,
): CodemodExampleScenarioOutput {
  return {
    ...scenario,
    source: scenario.source && transformLineEndings(scenario.source, lineEndings),
    fs:
      scenario.fs &&
      Object.fromEntries(
        Object.entries(scenario.fs).map(([path, content]) => [
          path,
          content && transformLineEndings(content, lineEndings),
        ]),
      ),
  };
}

type LineEndingsMode = 'cr' | 'crlf';

function isValidLineEndingsModeOption(value: unknown): value is LineEndingsMode | null | undefined {
  if (value == undefined) return true;
  if (typeof value !== 'string') return false;
  return isValidLineEndingsMode(value);
}

function isValidLineEndingsMode(value: string): value is LineEndingsMode {
  switch (value) {
    case 'cr':
    case 'crlf':
      return true;
    default:
      return false;
  }
}

function transformLineEndings(input: string, lineEndings: LineEndingsMode): string {
  switch (lineEndings) {
    case 'cr': {
      return stripUnixTrailingLine(input).replace(/\n/g, '\r');
    }
    case 'crlf': {
      return stripUnixTrailingLine(input).replace(/\n/g, '\r\n');
    }
    default: {
      return input;
    }
  }
}

function stripUnixTrailingLine(input: string): string {
  return input.endsWith('\n') ? input.slice(0, -1) : input;
}

function identity<T>(value: T): T {
  return value;
}
