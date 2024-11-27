# `transform-modules-to-packages-v33`

> _Transform Modules to Packages v33_

See the [`transform-grid-options`](../../plugins/transform-grid-options/) plugin for usage instructions.

## Common tasks

### Add a test case

Create a new unit test scenario for this transform:

```
pnpm run task:create-test --type transform --target transform-modules-to-packages-v33
```

### Add a new rule

Replacement rules are specified in [`replacements.ts`](./replacements.ts)

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform transform-modules-to-packages-v33
```
