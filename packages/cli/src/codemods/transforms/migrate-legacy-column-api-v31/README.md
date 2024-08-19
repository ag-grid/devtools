# `migrate-legacy-column-api-v31`

> _Migrate Legacy AG Grid Column API references_

## Description

As of AG Grid v31.0, all AG Grid Column API methods are now exposed on the Grid API instance.

This source code transformation rewrites AG Grid Column API references to target the Grid API object instead.

### Add to a codemod release

Add this source code transformation to a codemod release:

```
pnpm run task:include-transform --transform migrate-legacy-column-api-v31
```
