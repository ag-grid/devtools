import { ast, generate, getModuleRoot, matchNode, pattern as p } from '@ag-grid-devtools/ast';
import { describe, expect, test } from 'vitest';

import { getReactBoundElementRef } from './reactHelpers';

describe(getReactBoundElementRef, () => {
  test('locate React elements by ref', () => {
    const input = ast.module`
      import { useCallback, useRef } from 'react';

      export function App(props) {
        const buttonRef = useRef(null);
        const handleClick = useCallback(() => {
          buttonRef.current.disabled = true;
        }, []);
        return (
          <button ref={buttonRef} onClick={handleClick}>Disable</button>
        );
      }
    `;
    const program = getModuleRoot(input);
    const {
      refs: { refAccessor },
    } = matchNode(({ refAccessor }) => ast.statement`${refAccessor}.current.disabled = true;`, {
      refAccessor: p.identifier(),
    }).find(program)!;
    const binding = refAccessor.scope.getBinding(refAccessor.node.name);
    const element = binding && getReactBoundElementRef(binding);
    const actual = element && generate(element.node);
    const expected = `<button ref={buttonRef} onClick={handleClick}>Disable</button>`;
    expect(actual).toBe(expected);
  });
});
