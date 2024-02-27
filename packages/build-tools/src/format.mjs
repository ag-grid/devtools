export function formatOptionalString(value) {
  return JSON.stringify(value ?? '');
}

export function formatBoolean(value) {
  return JSON.stringify(value === true ? 'true' : '');
}
