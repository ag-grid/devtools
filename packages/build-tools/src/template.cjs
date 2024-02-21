const { mkdir, readdir, readFile, stat, writeFile } = require('node:fs/promises');
const { dirname, join } = require('node:path');

module.exports = {
  copyTemplateFile,
  copyTemplateFiles,
};

async function copyTemplateFiles(templateDir, outputDir, variables) {
  const templateFiles = await readdir(templateDir);
  return Promise.all(
    templateFiles.map((templateFilename) => {
      const outputFilename = withErrorPrefix(
        `Failed to process template filename "${join(templateDir, templateFilename)}"`,
        () => replaceVariables(templateFilename, variables),
      );
      const templateFilePath = join(templateDir, templateFilename);
      const outputFilePath = join(outputDir, outputFilename);
      return stat(templateFilePath).then((stats) =>
        stats.isDirectory()
          ? copyTemplateFiles(templateFilePath, outputFilePath, variables).then(
              ({ directories, files }) => ({
                directories: directories + 1,
                files,
              }),
            )
          : copyTemplateFile(templateFilePath, outputFilePath, variables).then(() => ({
              directories: 0,
              files: 1,
            })),
      );
    }),
  ).then((results) =>
    results.reduce(
      (totals, { directories, files }) => ({
        directories: totals.directories + directories,
        files: totals.files + files,
      }),
      { directories: 0, files: 0 },
    ),
  );
}

async function copyTemplateFile(templatePath, outputPath, variables) {
  await ensureDirectoryExists(dirname(outputPath));
  const source = await readFile(templatePath, 'utf-8');
  const output = withErrorPrefix(`Failed to process template "${templatePath}"`, () =>
    replaceVariables(source, variables),
  );
  return writeFile(outputPath, output);
}

function ensureDirectoryExists(directoryPath) {
  return mkdir(directoryPath, { recursive: true });
}

function withErrorPrefix(prefix, fn) {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      error.message = `${prefix}\n\n${error.message}`;
    }
    throw error;
  }
}

function replaceVariables(template, variables) {
  const tokens = parseTemplateString(template);
  return substituteTemplateStringVariables(tokens, variables);
}

function substituteTemplateStringVariables(tokens, variables) {
  return tokens
    .map((token) => {
      switch (token.type) {
        case 'literal': {
          return token.value;
        }
        case 'expression': {
          const key = token.expression;
          if (!variables.hasOwnProperty(key)) {
            throw new Error(`Invalid template variable: "${key}"`);
          }
          return String(variables[key]);
        }
      }
    })
    .join('');
}

function parseTemplateString(
  input,
  {
    startDelimiter = '<%=',
    endDelimiter = '%>',
    escapeSequences = {
      '\\>': '>',
      '\\<': '<',
      '\\\\': '\\',
    },
  } = {},
) {
  const escapeEntries = Object.entries(escapeSequences);
  const controlSequence = new RegExp(
    [
      escapeEntries.map(([pattern, replacement]) => escapeRegExpLiteralString(pattern)).join('|'),
      escapeRegExpLiteralString(startDelimiter),
    ].join('|'),
    'g',
  );
  const tokens = [];
  let currentIndex = 0;

  while (currentIndex < input.length) {
    const nextControlSequenceMatch = controlSequence.exec(input);
    const matchIndex = nextControlSequenceMatch?.index ?? input.length;
    if (currentIndex < matchIndex) {
      tokens.push({ type: 'literal', value: input.substring(currentIndex, matchIndex) });
    }
    if (!nextControlSequenceMatch) break;
    currentIndex = matchIndex;

    if (input.startsWith(startDelimiter, currentIndex)) {
      const expressionStartIndex = currentIndex + startDelimiter.length;
      const expressionEndIndex = input.indexOf(endDelimiter, expressionStartIndex);
      if (expressionEndIndex === -1) {
        throw new Error(
          `Invalid template string: unterminated "${startDelimiter}" at index ${currentIndex}`,
        );
      }
      const expression = input.substring(expressionStartIndex, expressionEndIndex).trim();
      tokens.push({ type: 'expression', expression });
      currentIndex = expressionEndIndex + endDelimiter.length;
      continue;
    }

    for (const [pattern, replacement] of escapeEntries) {
      if (input.startsWith(pattern, currentIndex)) {
        tokens.push({ type: 'literal', value: replacement });
        currentIndex += pattern.length;
        break;
      }
    }
  }

  return tokens;
}

function escapeRegExpLiteralString(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
