import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function getPackageJsonPath(pwd) {
  // Retrieve the package.json path from the closest ancestor directory
  let currentDir = pwd;
  while (true) {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) return packageJsonPath;
    const parentDir = dirname(currentDir);
    const isRoot = parentDir === currentDir;
    if (isRoot) break;
    currentDir = parentDir;
  }
  return null;
}
