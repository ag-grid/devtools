# @ag-grid-community/codemods

> _AG Grid codemods_

This package contains the automated source code transformations that are applied by the AG Grid developer toolkit CLI tool.

The codemods are bundled along with each developer toolkit release, and can be applied with the `migrate` CLI command.

## Codemod bundles

Codemods are organised by release. Each codemod release typically contains a set of source transformations that can be used to migrate a user's codebase to the AG Grid version specified by that release, *from* the version specified by the immediately preceding codemod release. This means that large migrations can be performed by running multiple sequential codemod releases back-to-back.

Note that a specific source transformation can be included in multiple releases: this is typically used to prepare for breaking changes during the 'deprecation' phase, then when the deprecation phase is complete and the breaking changes have happened, that specific transform will no longer be bundled for future releases.

### Releases

- [`31.0.0`](./src/versions/31.0.0)

### Contributing

See the [Developer Guide](./DEVELOPER.md) for more details.
