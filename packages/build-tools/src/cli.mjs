export function red(text) {
  return withAnsiEscape('[31m', text);
}

export function green(text) {
  return withAnsiEscape('[32m', text);
}

export function yellow(text) {
  return withAnsiEscape('[33m', text);
}

export function cyan(text) {
  return withAnsiEscape('[36m', text);
}

export function gray(text) {
  return withAnsiEscape('[90m', text);
}

export function bold(text) {
  return withAnsiEscape('[1m', text);
}

export function italic(text) {
  return withAnsiEscape('[3m', text);
}

function withAnsiEscape(style, text) {
  return `\u001b${style}${text}\u001b[0m`;
}
