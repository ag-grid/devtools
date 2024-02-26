# `add-module-imports`

> _Add ES module imports to a JavaScript/TypeScript file_

## Description

This plugin returns a source code transformation that will add the specified ES module imports to the target file.

## Usage

```
import template from '@babel/template';

const plugin = addModuleImports([
  template.ast`
    import 'foo' from './bar';
  `,
]);
```

The resulting output is a Babel [transform plugin](https://babeljs.io/docs/plugins#transform-plugins).

## Common tasks

### Creating a new Add Module Imports transform

Run the following script within the current workspace package:

```
pnpm run task:create-transform --plugin transform-grid-api-methods
```

This will prompt for the name of the transform, and will create the source files for the transform based on a template.

### Adding imports to an existing Add Module Imports transform

Module imports are typically defined in the `./imports.ts` file within a directory that defines a Add Module Imports transform.

See plugin output for usage examples.
