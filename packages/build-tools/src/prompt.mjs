import { clearScreenDown, moveCursor } from 'node:readline';
import readline from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { gray, green, red } from './cli.mjs';
import { parseBoolean } from './parse.mjs';

export function prompt(variables, { args = [], env = {}, input, output }) {
  const getValues = createPrompt(variables);
  const readline = createPromptReader({ input, output });
  const printline = createPromptWriter(output);
  return getValues({ args, env, readline, printline });
}

export function createPrompt(variables) {
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
    const processedVariables = [];
    while ((variable = prompts.shift())) {
      const { name, label, options: optionsFactory } = variable;
      const options = optionsFactory(values, env);
      const {
        prompt: promptLabel = label,
        value: optionsValue,
        options: choices,
        default: defaultValue = null,
        parse = String,
        format = JSON.stringify,
        validate,
      } = options;
      const hasExistingValue = name in parsedArgs || 'value' in options;
      const existingValue = hasExistingValue
        ? name in parsedArgs
          ? parse(parsedArgs[name])
          : optionsValue
        : null;
      const value = await (async () => {
        const question = getLineReaderPrompt(promptLabel, formatCliArg(name));
        if (hasExistingValue) {
          const answer = format(existingValue);
          const line = `${question} ${answer}`;
          await printline(line);
          return existingValue;
        } else {
          const answer = defaultValue;
          return parse(await readline(question, answer, choices));
        }
      })();
      const error = validate ? validate(value, values, env) : null;
      if (typeof error === 'string') {
        prompts.unshift(variable);
        await printline(red(error));
        if (hasExistingValue) return null;
      } else {
        values[name] = value;
        processedVariables.push({ name, format });
      }
    }
    await printline(
      [
        '',
        'Selected configuration:',
        '',
        ...processedVariables.map(
          ({ name, format = JSON.stringify }) =>
            `  ${formatCliArg(name)} ${formatVariableValue(format(values[name]))} \\`,
        ),
        '',
      ].join('\n'),
    );
    if (!skipConfirmation) {
      const proceed = parseBoolean(
        await readline('Do you want to proceed with this configuration?', 'yes'),
      );
      if (!proceed) return null;
    }
    return values;
  };
}

export function createPromptReader({ input, output }) {
  return (line, defaultValue, options) => {
    const rl = readline.createInterface({ input, output });
    const response = rl.question(`${line} `);
    if (options && options.length > 0) {
      const defaultOptionIndex = defaultValue != null ? options.indexOf(defaultValue) : -1;
      let selectedOptionIndex = defaultOptionIndex !== -1 ? defaultOptionIndex : null;
      listOptions(rl, options, selectedOptionIndex);
      rl.input.on('keypress', (char, key) => {
        switch (key.name) {
          case 'tab':
          case 'down': {
            selectedOptionIndex = ((selectedOptionIndex ?? -1) + 1) % options.length;
            changeSelectedIndex(rl, options, selectedOptionIndex);
            break;
          }
          case 'up': {
            selectedOptionIndex =
              (options.length + (selectedOptionIndex ?? 0) - 1) % options.length;
            changeSelectedIndex(rl, options, selectedOptionIndex);
            break;
          }
          case 'return': {
            clearScreenDown(rl.output);
            break;
          }
          default: {
            selectedOptionIndex = null;
          }
        }
      });
      function changeSelectedIndex(rl, options, selectedOptionIndex) {
        clearInput(rl);
        listOptions(rl, options, selectedOptionIndex);
        rl.write(options[selectedOptionIndex]);
      }
    }
    if (defaultValue != null) rl.write(defaultValue);
    return response.finally(() => rl.close());
  };

  function clearInput(rl) {
    rl.write(null, { ctrl: true, name: 'u' });
  }

  function listOptions(rl, options, selectedIndex) {
    rl.pause();
    const inputCursorPos = rl.getCursorPos();
    const formattedOptions = options.map((value, index) => {
      const isSelected = index === selectedIndex;
      const message = `${isSelected ? '◉' : '◯'} ${value}`;
      return isSelected ? green(message) : message;
    });
    const outputLines = ['', ...formattedOptions, ''];
    rl.output.write(outputLines.join('\n'));
    moveCursor(rl.input, inputCursorPos.cols, -(outputLines.length - 1));
    rl.resume();
  }
}

export function createPromptWriter(output) {
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
