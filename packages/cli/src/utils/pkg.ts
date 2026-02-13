import { name, version } from '../../package.json' with { type: 'json' };

export function getCliPackageName(): string {
  return name;
}

export function getCliPackageVersion(): string {
  return version;
}

export function getCliCommand(): string {
  return `npx ${getCliPackageName()}@latest`;
}
