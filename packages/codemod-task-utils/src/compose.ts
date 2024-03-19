import type { Codemod, CodemodResult, CodemodTaskResult } from '@ag-grid-devtools/types';

export function composeCodemods(codemods: Array<Codemod>): Codemod {
  return (input, runner): CodemodResult => {
    const { path, source } = input;
    const initialState: CodemodTaskResult = {
      result: { source, updated: null },
      errors: [],
      warnings: [],
    };
    const { result, errors, warnings } = codemods.reduce((state, codemod): CodemodTaskResult => {
      const { result: existingResult, errors: existingErrors, warnings: existingWarnings } = state;
      const { source, updated } = existingResult;
      const codemodResult = codemod({ path, source: updated ?? source }, runner);
      const updatedResult =
        codemodResult.source != null
          ? {
              source,
              updated: codemodResult.source ?? existingResult.updated,
            }
          : existingResult;
      const updatedErrors = [...existingErrors, ...codemodResult.errors];
      const updatedWarnings = [...existingWarnings, ...codemodResult.warnings];
      return {
        result: updatedResult,
        errors: updatedErrors,
        warnings: updatedWarnings,
      };
    }, initialState);
    return {
      source: result.updated,
      errors,
      warnings,
    };
  };
}
