# `transform-grid-api-methods-v31`

See the [`transform-grid-api-methods`](../../plugins/transform-grid-api-methods/) plugin for usage instructions.

## Common tasks

### Add a new rule

Replacement rules are specified in [`replacements.ts`](./replacements.ts)

### Add a test case

Create a new unit test scenario for this transform:

```
pnpm run task:create-test --type transform --target transform-grid-options-v31
```

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform transform-grid-api-methods-v31
```