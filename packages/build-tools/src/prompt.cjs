const { parseArgs } = require('node:util');
const readline = require('node:readline/promises');
const { gray, green, red } = require('./cli.cjs');

module.exports = {
  prompt,
  createPrompt,
  createPromptReader,
  createPromptWriter,
};

function prompt(variables, { args = [], env = {}, input, output }) {
  const getValues = createPrompt(variables);
  const readline = createPromptReader({ input, output });
  const printline = createPromptWriter(output);
  return getValues({ args, env, readline, printline });
}

function createPrompt(variables) {
  return async ({ args, env, printline, readline }) => {
    const {
      values: { y: skipConfirmation = false, ...parsedArgs },
    } = parseArgs({
      args,
      options: getArgParserOptions(variables),
      strict: false,
      allowPositionals: false,
    });
    const prompts = [...variables];
    const values = {};
    let variable;
    while ((variable = prompts.shift())) {
      const {
        name,
        label,
        value: valueGetter,
        default: defaultValue,
        parse = String,
        format = String,
        validate,
      } = variable;
      const hasExistingValue = name in parsedArgs || 'value' in variable;
      const existingValue = hasExistingValue
        ? name in parsedArgs
          ? parse(parsedArgs[name])
          : valueGetter(values, env)
        : null;
      const value = await (async () => {
        const question = getLineReaderPrompt(label, formatCliArg(name));
        if (hasExistingValue) {
          const answer = format(existingValue);
          const line = `${question} ${answer}`;
          await printline(line);
          return existingValue;
        }
        const answer = defaultValue ? defaultValue(values, env) : null;
        return parse(await readline(question, answer));
      })();
      const error = validate ? validate(value, values, env) : null;
      if (typeof error === 'string') {
        prompts.unshift(variable);
        await printline(red(error));
        if (hasExistingValue) return null;
      } else {
        values[name] = value;
      }
    }
    await printline(
      [
        '',
        'Selected configuration:',
        '',
        ...variables.map(
          ({ name, format = JSON.stringify }) =>
            `  ${formatCliArg(name)} ${formatVariableValue(format(values[name]))} \\`,
        ),
        '',
      ].join('\n'),
    );
    if (!skipConfirmation) {
      const proceed = await readline('Do you want to proceed with this configuration?', 'yes');
      switch (proceed.toLowerCase()) {
        case 'yes':
        case 'y':
        case 'ok':
          break;
        default:
          return null;
      }
    }
    return values;
  };
}

function createPromptReader({ input, output }) {
  return (line, defaultValue) => {
    const rl = readline.createInterface({ input, output });
    const response = rl.question(`${line} `);
    if (defaultValue != null) rl.write(defaultValue);
    return response.finally(() => rl.close());
  };
}

function createPromptWriter(output) {
  return (line) =>
    new Promise((resolve, reject) => {
      output.write(`${line}\n`, (_, error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
}

function getArgParserOptions(variables) {
  return Object.fromEntries([
    ...variables.map(({ name }) => [name, { type: 'string' }]),
    ['y', { type: 'boolean' }],
  ]);
}

function getLineReaderPrompt(label, hint) {
  return `${label}:${hint ? ` ${hint}` : ''}`;
}

function formatCliArg(name) {
  return gray(`--${name}`);
}

function formatVariableValue(value) {
  return green(value);
}
