export interface PackageManifest {
  name: string;
  versions: Array<VersionManifest>;
}

export interface VersionManifest<TChoices = any> {
  version: string;
  codemodPath: string;
  transforms: Array<TransformManifest>;
  /** @inquirer/prompts */
  choices?: Record<keyof TChoices, () => Promise<any>>;
  setAnswers?: Record<keyof TChoices, (answer: any) => void>;
}

export interface TransformManifest {
  name: string;
  description: string;
}
