# `transform-grid-api-methods-v31-3`

> _Transform deprecated Grid API method invocations_

See the [`transform-grid-api-methods`](../../plugins/transform-grid-api-methods/) plugin for usage instructions.

## Common tasks

### Add a test case

Create a new unit test scenario for this transform:

```
pnpm run task:create-test --type transform --target transform-grid-api-methods-v31-3
```

### Add a new rule

Replacement rules are specified in [`replacements.ts`](./replacements.ts)

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform transform-grid-api-methods-v31-3
```
