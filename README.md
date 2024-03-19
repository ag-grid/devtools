# AG Grid Developer Tools

This repository contains a selection of developer tools related to [AG Grid](https://github.com/ag-grid/ag-grid) development.

## Repository layout

This repository is organised as a monorepo containing various packages.

The following packages contain user-facing tools:

- [`cli`](./packages/cli/): AG Grid developer toolkit
- [`codemods`](./packages/codemods/): AG Grid codemods (bundled with the AG Grid developer toolkit)

The following packages contain internal library helpers:

- [`ast`](./packages/ast/): AST transformation tools
- [`codemod-utils`](./packages/codemod-utils/): Codemod utility helpers
- [`codemod-task-utils`](./packages/codemod-task-utils/): Codemod task runner helpers
- [`systemjs-plugin`](./packages/systemjs-plugin/): SystemJS plugin for TypeScript/JSX/CSS source files
- [`test-utils`](./packages/test-utils/): Automated testing helpers
- [`worker-utils`](./packages/worker-utils/): Worker utility helpers
- [`types`](./packages/types/): Shared type definitions

The following packages contain configuration shared across multiple internal packages:

- [`build-config`](./packages/build-config/): Build tool configuration
- [`build-tools`](./packages/build-tools/): Custom build tools

## Developing

### Installation

This repository uses [pnpm](https://pnpm.io/) to manage its dependencies. This can be installed via the Node.js built-in [corepack](https://nodejs.org/api/corepack.html) system as follows:

```
corepack enable
corepack prepare pnpm@latest --activate
```

Once installed, run the following command to install the project dependencies:

```
pnpm install
```

### Contributing

See the [Developer Guide](./DEVELOPER.md) for more details.
