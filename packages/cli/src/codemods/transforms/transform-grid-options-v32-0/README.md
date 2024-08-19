# `transform-grid-options-v32-0`

> _Transform deprecated Grid options_

See the [`transform-grid-options`](../../plugins/transform-grid-options/) plugin for usage instructions.

## Common tasks

### Add a test case

Create a new unit test scenario for this transform:

```
pnpm run task:create-test --type transform --target transform-grid-options-v32-0
```

### Add a new rule

Replacement rules are specified in [`replacements.ts`](./replacements.ts)

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform transform-grid-options-v32-0
```
