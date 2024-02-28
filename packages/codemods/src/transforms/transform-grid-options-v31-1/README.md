# `transform-grid-options-v31-1`

> _Transform deprecated Grid options_

Replacement rules are specified in [`replacements.ts`](./replacements.ts).

See the [`transform-grid-options`](../../plugins/transform-grid-options/) plugin for usage instructions.

## Common tasks

### Add a new rule

Replacement rules are specified in [`replacements.ts`](./replacements.ts)

### Add a test case

Create a new unit test scenario for this transform:

```
pnpm run task:create-test --type transform --target transform-grid-options-v31-1
```

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform transform-grid-options-v31-1
```
