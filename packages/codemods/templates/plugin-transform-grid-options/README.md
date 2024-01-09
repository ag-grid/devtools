# `<%= filename %>`

> _<%= description %>_

Replacement rules are specified in [`replacements.ts`](./replacements.ts).

See the [`<%= plugin %>`](../../plugins/<%= plugin %>/) plugin for usage instructions.

## Common tasks

### Add a new rule

Replacement rules are specified in [`replacements.ts`](./replacements.ts)

### Add a test case

Create a new unit test scenario for this transform:

```
pnpm run task:create-test --type transform --target <%= filename %>
```

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform <%= filename %>
```
