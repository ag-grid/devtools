# `migrate-legacy-js-grid-constructor-v31`

> _Migrate Legacy AG Grid constructor calls_

## Description

As of AG Grid v31.0, the recommended way to create vanilla JavaScript AG Grid instances is via the newly-added `createGrid()` function, rather than the legacy `new Grid()` constructor calls.

This source code transformation rewrites legacy constructor calls to use the new syntax.

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform migrate-legacy-js-grid-constructor-v31
```
