import { withErrorPrefix } from '../error';
import { loadExampleScenarios, type ExampleVitestHelpers } from './example';

export interface AstTransformExampleScenarioData<O extends object = object> {
  input: string;
  output: string | null;
  errors: string | null;
  warnings: string | null;
  options?: O & {
    lineEndings?: LineEndingsMode | undefined;
  };
}

export interface AstTransformExampleScenarioInput<O extends object = object> {
  path: string;
  errorsPath: string | null;
  warningsPath: string | null;
  source: string;
  options: O | null;
}

export interface AstTransformExampleScenarioOutput {
  source: string | null;
  errors: Array<Error>;
  warnings: Array<Error>;
}

export function loadAstTransformExampleScenarios<O extends object = object>(
  scenariosPath: string,
  options: {
    runner: (input: AstTransformExampleScenarioInput<O>) => AstTransformExampleScenarioOutput;
    vitest: ExampleVitestHelpers;
  },
): void {
  const { runner, vitest } = options;
  const { expect } = vitest;
  return loadExampleScenarios<
    AstTransformExampleScenarioData<O>,
    AstTransformExampleScenarioInput<O>,
    AstTransformExampleScenarioOutput
  >(scenariosPath, {
    vitest,
    loader: (data, files, { getExampleFilePath, readExampleFile }) => {
      const { input, output, errors, warnings, options } = data;
      const lineEndings = options?.lineEndings;
      if (!isValidLineEndingsModeOption(lineEndings)) {
        throw new Error(`Invalid line endings mode: ${lineEndings}`);
      }
      const inputPath = getExampleFilePath(input);
      const inputSource = readExampleFile(input);
      const errorsPath = errors == null ? null : getExampleFilePath(errors);
      const warningsPath = warnings == null ? null : getExampleFilePath(warnings);
      const outputSource = output == null ? null : readExampleFile(output);
      const outputErrors = errorsPath == null ? [] : require(errorsPath);
      const outputWarnings = warningsPath == null ? [] : require(warningsPath);
      return {
        input: {
          scenario: {
            path: inputPath,
            errorsPath,
            warningsPath,
            source: lineEndings ? transformLineEndings(inputSource, lineEndings) : inputSource,
            options: options ?? null,
          },
          files: lineEndings ? transformFsLineEndings(files.input, lineEndings) : files.input,
        },
        expected: {
          output: {
            source:
              outputSource && lineEndings
                ? transformLineEndings(outputSource, lineEndings)
                : outputSource,
            errors: outputErrors,
            warnings: outputWarnings,
          },
          files: lineEndings ? transformFsLineEndings(files.expected, lineEndings) : files.expected,
        },
      };
    },
    runner: ({ scenario }) => runner(scenario),
    assert: (expected, actual, input, scenarioPath) => {
      withErrorPrefix(input.path, () => {
        expect(actual.source ?? input.source).toEqual(expected.source ?? input.source);
      });
      withErrorPrefix(input.errorsPath ?? scenarioPath, () => {
        expect(actual.errors).toEqual(expected.errors);
      });
      withErrorPrefix(input.warningsPath ?? scenarioPath, () => {
        expect(actual.warnings).toEqual(expected.warnings);
      });
    },
  });
}

function transformFsLineEndings(
  files: Record<string, string>,
  lineEndings: LineEndingsMode,
): Record<string, string>;
function transformFsLineEndings(
  files: Record<string, string | null>,
  lineEndings: LineEndingsMode,
): Record<string, string | null>;
function transformFsLineEndings(
  files: Record<string, string | null>,
  lineEndings: LineEndingsMode,
): Record<string, string | null> {
  return Object.fromEntries(
    Object.entries(files).map(([path, content]) => [
      path,
      content && transformLineEndings(content, lineEndings),
    ]),
  );
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
