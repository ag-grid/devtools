#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const { createRequire } = require('node:module');

const [inputPath, outputPath, overrideVersion = null] = process.argv.slice(2);
const workspaceVersions = parseWorkspaceDependencyVersions(process.env.PKG_WORKSPACE_VERSIONS);

class ExitError extends Error {
  code;
  constructor(code, message) {
    super(`Error: ${message}`);
    this.name = ExitError.name;
    this.code = code;
  }
}

try {
  if (!inputPath) throw new ExitError(1, 'Missing package.json input path');
  const inputPkgPath =
    path.basename(inputPath) === 'package.json' ? inputPath : path.join(inputPath, 'package.json');
  const pkgSource = (() => {
    try {
      return fs.readFileSync(inputPkgPath, 'utf-8');
    } catch (error) {
      throw new ExitError(1, `Failed to read package.json: ${inputPkgPath} (${error.code})\n`);
    }
  })();
  const pkg = (() => {
    try {
      return JSON.parse(pkgSource);
    } catch {
      throw new ExitError(1, `Invalid package.json contents: ${inputPkgPath}\n`);
    }
  })();
  const {
    name,
    version: pkgVersion,
    license,
    description,
    author,
    homepage,
    repository,
    bugs,
    keywords,
    dependencies,
    bundleDependencies,
    optionalDependencies,
    pkg: pkgOverrides,
  } = pkg;
  const { version: pkgOverridesVersion, ...overrides } = pkgOverrides ?? {};
  const version = overrideVersion ?? pkgOverridesVersion ?? pkgVersion;
  const pkgFields = {
    name,
    version,
    license,
    description,
    author,
    homepage,
    repository,
    bugs,
    keywords,
    dependencies,
    bundleDependencies,
    optionalDependencies,
    ...overrides,
  };
  const updatedPkg = fixPackageWorkspaceDependencies(pkgFields, inputPkgPath, {
    ...workspaceVersions,
    [name]: version,
  });
  const json = `${JSON.stringify(updatedPkg, null, 2)}\n`;
  if (outputPath) {
    try {
      fs.writeFileSync(outputPath, json);
      exit(0);
    } catch (error) {
      throw new ExitError(1, `Failed to write output package.json: ${outputPath} (${error.code})`);
    }
  } else {
    process.stdout.write(json, (error) => {
      if (error) {
        exit(1, `Failed to write output JSON: (${error.code})`);
      } else {
        exit(0);
      }
    });
  }
} catch (error) {
  if (error instanceof ExitError) {
    exit(error.code, error.message);
  } else {
    throw error;
  }
}

function parseWorkspaceDependencyVersions(envValue) {
  if (!envValue) return {};
  return Object.fromEntries(envValue.split(',').map((pair) => pair.split(':')));
}

function fixPackageWorkspaceDependencies(pkg, inputPkgPath, versionOverrides) {
  const require = createRequire(path.resolve(process.cwd(), inputPkgPath));
  return Object.fromEntries(
    Object.entries(pkg).map(([key, value]) => {
      if (!isDependenciesPackageField(key) || !value) return [key, value];
      return [key, fixWorkspaceDependencyVersions(value, require, versionOverrides)];
    }),
  );
}

function fixWorkspaceDependencyVersions(dependencies, require, versionOverrides) {
  return Object.fromEntries(
    Object.entries(dependencies).map((dependency) => {
      const [name, version] = dependency;
      if (version === 'workspace:*') {
        const version = versionOverrides[name] ?? require(path.join(name, 'package.json')).version;
        return [name, version];
      }
      return dependency;
    }),
  );
}

function isDependenciesPackageField(key) {
  switch (key) {
    case 'dependencies':
    case 'devDependencies':
    case 'peerDependencies':
      return true;
    default:
      return false;
  }
}

function exit(code, message) {
  if (typeof message === 'string') process.stderr.write(`${message}\n`);
  process.exit(code);
}
