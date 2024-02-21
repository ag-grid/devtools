const { statSync, existsSync } = require('node:fs');

module.exports = {
  validateDirectory,
  validateEmptyPath,
  validateFilename,
};

function validateDirectory(value) {
  const filenameError = validateFilename(value);
  if (typeof filenameError === 'string') return filenameError;
  const stat = getPathStats(value);
  if (!stat) return `Provided path does not exist: "${value}"`;
  if (!stat.isDirectory()) return `Provided path is not a directory: "${value}"`;
  return null;
}

function validateEmptyPath(value) {
  const filenameError = validateFilename(value);
  if (typeof filenameError === 'string') return filenameError;
  if (existsSync(value)) return `Provided path already exists: "${value}"`;
  return null;
}

function validateFilename(value) {
  if (typeof value !== 'string') {
    if (value) return `Provided path is not a valid filename: ${JSON.stringify(value)}`;
    return 'No path provided';
  }
  return null;
}

function getPathStats(path) {
  try {
    return statSync(path);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
