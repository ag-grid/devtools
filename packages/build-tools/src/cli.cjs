module.exports = {
  red,
  green,
  yellow,
  cyan,
  gray,
  bold,
  italic,
};

function red(text) {
  return withAnsiEscape('[31m', text);
}

function green(text) {
  return withAnsiEscape('[32m', text);
}

function yellow(text) {
  return withAnsiEscape('[33m', text);
}

function cyan(text) {
  return withAnsiEscape('[36m', text);
}

function gray(text) {
  return withAnsiEscape('[90m', text);
}

function bold(text) {
  return withAnsiEscape('[1m', text);
}

function italic(text) {
  return withAnsiEscape('[3m', text);
}

function withAnsiEscape(style, text) {
  return `\u001b${style}${text}\u001b[0m`;
}
