import { type Codemod } from './codemod';

export interface PackageManifest<T> {
  name: string;
  versions: Array<VersionManifest<T>>;
}

export interface VersionManifest<T> {
  version: string;
  codemod: Codemod;
  transforms: Array<TransformManifest<T>>;
}

export interface TransformManifest<T> {
  name: string;
  description: string;
  transform: T;
}
