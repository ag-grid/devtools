export interface PackageManifest {
  name: string;
  versions: Array<VersionManifest>;
}

export interface VersionManifest {
  version: string;
  codemodPath: string;
  transforms: Array<TransformManifest>;
}

export interface TransformManifest {
  name: string;
  description: string;
}
