# `transform-grid-options`

> _Transform AG Grid options_

## Description

This plugin returns a source code transformation that will update fields on AG Grid options objects, including modifying the relevant attributes on AG Grid React/Angular/Vue elements.

## Common tasks

### Creating a new Grid Options transform

Run the following script within the current workspace package:

```
pnpm run task:create-transform --plugin transform-grid-options
```

This will prompt for the name of the transform, and will create the source files for the transform based on a template.

### Adding rules to an existing Grid Options transform

Grid option transformation rules are typically defined in the `./replacements.ts` file within a directory that defines a Grid Options transform.

See existing transforms for usage examples.
