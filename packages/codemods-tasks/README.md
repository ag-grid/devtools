# Developer Guide

### Adding new transformation rules to an existing codemod

Codemods typically comprise a set of source transformations.

See the README instructions for the relevant [source transformation](./src/transforms) for details on how to add new transformation rules.

### Creating a new codemod

All codemods are tied to a specific release version. To create a new codemod release, navigate to the packages/codemods-tasks directory within the repository and run the following command:

```
pnpm run task:create-version
```

This will prompt for the version number of the release, and will create the source files for the codemod based on a template.

Additionally, the codemod will be referenced where necessary in source code to be exposed by the package.

If you inspect the generated files, you will see that a codemod is essentially just a function that transforms an arbitrary input source file into a transformed output source file (see the [`Codemod`](../types/src/codemod.ts) type definition for the exact details).

While this is very flexible, it doesn't provide much structure for transforming source code. In most cases, codemods will be performing AST transformations rather than raw text manipulations, and therefore the default codemod template creates the boilerplate for a codemod that performs a sequence of AST transformations expressed as [Babel transform plugins](https://babeljs.io/docs/plugins#transform-plugins) (see the [`AstTransform`](../ast/src/types/transform.ts) for the exact details). The rest of these instructions assume that your codemods will be based on Babel AST transformations, however you can always transform other file formats if necessary.

The newly-generated codemod version contains a `transforms.ts` file that specifies which AST transformations to apply. If you inspect this file, you will see that it does not yet specify any transforms, and will therefore not perform any code modifications when invoked.

In order to modify user code, the codemod must apply one or more source code transformations.

### Creating a new transform

To create a new source code transformation, run the following command:

```
pnpm run task:create-transform
```

This will prompt for the name of the transform, and the version of the codemod that this transform relates to, and will create the source files for the transform based on a template.

Often the codemod for a given version will perform similar tasks to codemods for previous releases. For this reason, various [plugins](./src/plugins) are provided as templates for creating new transforms from an existing pattern. The generator command will prompt whether to create the transform based on one of these plugin templates, falling back to a generic AST transform if no plugin is specified. The different plugins provide different configuration options, so see the plugin source code for usage instructions.

Note that the newly-created transform is a Babel transform plugin - see Babel's [Plugin Development documentation](https://babeljs.io/docs/plugins#plugin-development) for more details on how to write plugins.

If you chose to add this transform to a codemod version when prompted generator command, the transform will be exposed in that codemod version's `transforms.ts` file.

### Adding an existing transform to a codemod version

To add a source code transformation that already exists, run the following command:

```
pnpm run task:include-transform
```

This will prompt for the name of the transform and the version of the target codemod, and will update the codemod appropriately so that it applies the transform.

### Creating a new test case

The easiest way to confirm that a codemod works as expected is to provide test cases that assert the expected output for a given input.

To create a new test case, run the following command:

```
pnpm run task:create-test
```

This will prompt for the name of the codemod or transform that you want to test and the name of the test scenario, and will create the source files for the test scenario based on a template.

#### Test scenario format

Generated test cases are detected via filesystem naming convention, whereby each test scenario is a directory within the relevant `__fixtures__/scenarios` directory that contains a file named `scenario.json` that is used to describe the test scenario.

Test scenario directories can be nested within the filesystem to

A `scenario.json` file can contain the following fields:

```
{
  "skip": false,
  "only": false,
  "scenario": {
    "input": "input.js",
    "output": "output.js",
    "errors": "output.errors.cjs",
    "warnings": "output.warnings.cjs"
  },
  "files": {
    "input": {
      "foo.js": "input.foo.js",
    },
    "output": {
      "foo.js": "output.foo.js"
    }
  }
}
```

##### `skip` (optional)

If set to `true`, the scenario runner will skip this test scenario

##### `only` (optional)

If set to `true`, the scenario runner will skip any other test scenarios in this suite that do not also specify `"only": true`

##### `scenario.input`

Relative path to a file that contains the 'input' source that is passed to the codemod

##### `scenario.output`

Relative path to a file that contains the expected 'output' source that has been modified by the codemod

##### `scenario.errors`

Relative path to a file that contains a list of errors expected to be emitted by the codemod.

The referenced file is a CommonJS file that exports an array of JavaScript `Error` objects, such as the following:

```
module.exports = [
  new SyntaxError('Invalid syntax: "foo"'),
];
```

##### `scenario.warnings`

Relative path to a file that contains a list of warnings expected to be emitted by the codemod.

The referenced file has the same structure as the file referenced by the `errors` field.

##### `files` (optional)

This is necessary to handle collateral files that might be affected by the codemod (e.g. external component template files).

If the `files` field is present:

- The `files.input` object declares a set of additional mocked files present in the simulated filesystem exposed to the codemod test runner (where the object keys are the relative paths of the simulated files, and the object values are relative paths to files that contain the contents of that file)
- The `files.output` object declares a set of files expected to be present in the simulated filesystem after the codemod test runner has finished executing (where the object keys are the relative paths of the simulated files, and the object values are relative paths to files that contain to the expected contents of that file)

All paths within the `files` object key/values are relative to the directory that contains the `scenario.json` file.
