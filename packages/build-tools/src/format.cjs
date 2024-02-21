module.exports = {
  formatOptionalString,
};

function formatOptionalString(value) {
  return JSON.stringify(value ?? '');
}
