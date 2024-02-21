const { readdirSync } = require('node:fs');

module.exports = {
  isValidReleaseVersion,
  retrieveExistingVersions,
  getLatestReleaseVersion,
  getNextReleaseVersion,
  parseReleaseVersion,
};

function isValidReleaseVersion(value) {
  return parseReleaseVersion(value) !== null;
}

function retrieveExistingVersions(versionsDir) {
  return readdirSync(versionsDir).filter(isValidReleaseVersion);
}

function getLatestReleaseVersion(versions) {
  return versions
    .map(parseReleaseVersion)
    .reduce(
      (latestVersion, versionNumber) =>
        latestVersion ? getMaxReleaseVersion(latestVersion, versionNumber) : versionNumber,
      null,
    )
    ?.join('.');
}

function getNextReleaseVersion(versions, type = 'patch') {
  const latestVersion = getLatestReleaseVersion(versions);
  const [major, minor, patch] = latestVersion ? parseReleaseVersion(latestVersion) : [0, 0, 0];
  switch (type) {
    case 'major':
      return [major + 1, 0, 0].join('.');
    case 'minor':
      return [major, minor + 1, 0].join('.');
    case 'patch':
      return [major, minor, patch + 1].join('.');
    default:
      throw new Error(`Invalid release version type: ${type}`);
  }
}

function parseReleaseVersion(versions) {
  const match = /^(\d+)\.(\d+)\.(\d)+$/.exec(versions);
  if (!match) return null;
  const [, major, minor, patch] = match;
  return [major, minor, patch].map(Number);
}

function getMaxReleaseVersion(left, right) {
  const result = left.reduce((result, leftValue, index) => {
    if (result) return result;
    const rightValue = right[index];
    if (rightValue === leftValue) return null;
    if (rightValue > leftValue) return right;
    return left;
  }, null);
  return result || right;
}
