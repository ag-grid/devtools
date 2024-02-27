export function parseOptionalString(value) {
  return value || null;
}

export function parseBoolean(value) {
  switch (value.toLowerCase()) {
    case 'yes':
    case 'y':
    case 'ok':
    case 'true':
      return true;
    default:
      return false;
  }
}
