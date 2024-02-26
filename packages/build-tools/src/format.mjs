export function formatOptionalString(value) {
  return JSON.stringify(value ?? '');
}
