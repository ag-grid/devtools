import { name, version } from '../../package.json' assert { type: 'json' };

export function getCliPackageName(): string {
  return name;
}

export function getCliPackageVersion(): string {
  return version;
}

export function getCliCommand(): string {
  return `npx ${getCliPackageName()}@${getCliPackageVersion().replace(/^(\d+\.\d+).+$/, '$1')}`;
}
