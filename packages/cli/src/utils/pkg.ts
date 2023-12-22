import pkg from '../../package.json' assert { type: 'json' };
const { name, version } = pkg as { name: string; version: string };
// FIXME: reinstate
// import { name, version } from '../../package.json' assert { type: 'json' };

export function getPackageName(): string {
  return name;
}

export function getPackageVersion(): string {
  return version.replace(/^(\d+\.\d+).+$/, '$1');
}

export function getCliCommand(): string {
  return `npx ${getPackageName()}@${getPackageVersion()}`;
}
