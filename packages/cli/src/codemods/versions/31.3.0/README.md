# 31.3.0

Codemod for upgrading to [AG Grid v31.3.0](https://github.com/ag-grid/ag-grid/releases/tag/v31.3.0)

## Usage

```
npx @ag-grid-devtools/cli migrate --to 31.3.0
```

Source code transformations applied by this codemod are specified in [`transforms.ts`](./transforms.ts).

## Common tasks

### Add a transform

Option 1: Create a new source code transformation to add to this codemod release version:

```
pnpm run task:create-transform --release 31.3.0
```

Option 2: Add an existing source code transformation to this codemod release version:

```
pnpm run task:include-transform --version 31.3.0
```

### Add a test case

Create a new unit test scenario for this version:

```
pnpm run task:create-test --type version --target 31.3.0
```
