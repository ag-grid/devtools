# Developer Guide

## Package scripts

This workspace contains the following top-level npm scripts:

- `ci`: Run tests across the the whole repository and build all public packages
- `lint`: Lint the source code across the whole repository
- `test`: Run tests across the whole repository (or use `test:watch` to enable watch mode)
- `verify`: Lint and run tests across the whole repository
- `coverage`: Generate a test coverage report across the whole repository
- `build`: Build all public packages
- `clean`: Clean all build artifacts
- `version`: Retrieve the public package version (according to the source code within the repository)
- `publish`: Publish all public packages to npm

## Common tasks

### Adding dependencies

This repository uses pnpm's [Workspaces](https://pnpm.io/workspace) feature to manage internal dependencies between packages.

To add dependencies within a package, use one of the following methods:

- Edit the relevant package's `package.json`, then run `pnpm install` anywhere within the repository
- `cd` into the relevant package, then run `pnpm add <dependency>` to install the dependency
- run `pnpm add --filter <package> <dependency>`  anywhere within the repository

See `pnpm add --help` and the [pnpm workspaces documentation](https://pnpm.io/workspace) for more details.

## Code style

This workspace uses Prettier for code formatting, with rules enforced via ESLint.

## Workflow

This project uses Github pull requests (PRs) for merging code, and Github Actions for continuous integration (CI).

### Git branch strategy

This repository contains the following long-lived branches:

- `main`: Branch containing the most recently published version
- `develop`: Stable development branch containing the upcoming 'next' release

Points to note:

- Branch protection rules and CI tests are in place for both these branches to prevent accidentally committing broken code changes
- Features not yet ready for release remain on short-lived feature branches until they are ready to be merged into the `develop` branch
- Packages are automatically published by CI whenever a PR is successfully merged into the `main` branch

### Development workflow

Changes are committed to the repository as follows:

1. Create a new feature branch from the current `develop` branch, named with the relevant prefix:
    - `feature/...` - Branch contains new features
    - `fix/...` - Branch contains bugfixes
    - `docs/...` - Branch contains documentation updates
    - `chore/...` - Branch contains routine admin tasks
    > _Note that a `wip/...` prefix indicates a branch that is not intended to be merged_
2. Commit code changes to the feature branch
3. Rebase on the latest `develop` branch to incorporate upstream changes
4. Raise a PR that targets `develop` as its base branch
5. Wait for CI tests to pass
6. Merge the PR using the 'rebase' merge strategy

### Releasing

When the contents of the `develop` branch are ready to be released, follow these steps to publish a new version: 

1. Ensure that `@ag-grid-devtools/cli` package version has been incremented in the `develop` branch:
    ```
    git diff origin/main..origin/develop -- ./packages/cli/package.json |
      grep '"version": ".*"' && echo "Ready to publish" || echo "Version already published"
    ```
2. Raise a new PR that merges `develop` into `main`
3. Wait for CI tests to pass
4. Merge the PR using the 'merge commit' merge strategy

This will cause CI to perform the following actions:

- Build and publish all public packages
- Tag the repository with the current package version
- Create a Github 'Release' page linked to the release commit
