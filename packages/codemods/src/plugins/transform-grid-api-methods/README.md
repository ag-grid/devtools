# `transform-grid-api-methods`

> _Transform AG Grid API Methods_

## Description

This plugin returns a source code transformation that will update method invocations that target AG Grid API instances.

## Common tasks

### Creating a new Grid API Methods transform

Run the following script within the current workspace package:

```
pnpm run task:create-transform --plugin transform-grid-api-methods
```

This will prompt for the name of the transform, and will create the source files for the transform based on a template.

### Adding rules to an existing Grid API Methods transform

Grid API method transformation rules are typically defined in the `./replacements.ts` file within a directory that defines a Grid API Methods transform.

See existing transforms for usage examples.
