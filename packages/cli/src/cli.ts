import { Enum, dynamicRequire, match } from '@ag-grid-devtools/utils';
import path from 'path';
import {
  parseArgs as parseMigrateCommandArgs,
  cli as migrate,
  type MigrateCommandArgs,
} from './commands/migrate';
import { type CliEnv, type CliOptions } from './types/cli';
import { type WritableStream } from './types/io';
import { CliArgsError } from './utils/cli';
import { getCliCommand } from './utils/pkg';
import { log } from './utils/stdio';

export { CliError } from './utils/cli';

type CliCommand = Enum<{
  Migrate: {
    args: MigrateCommandArgs;
  };
}>;

const CliCommand = Enum.create<CliCommand>({
  Migrate: true,
});

interface Args {
  /**
   * Command to run
   */
  command: CliCommand | null;
  /**
   * Show the current version of the CLI tool
   */
  version: boolean;
  /**
   * Show usage instructions
   */
  help: boolean;
  /**
   * Prefer AG Grid enterprise imports
   */
  enterprise: boolean;
}

function usage(env: CliEnv): string {
  return `
Usage: ${getCliCommand()} [command] [options]

AG Grid developer toolkit

Commands:
  migrate         Migrate project source files for an upgraded AG Grid version

Options:
  --version, -v   Print the version of the command-line tool
  --prefer-enterprise, -p Prefer AG Grid enterprise imports
  --help, -h      Show usage instructions for the specified command

See individual command help for more options
`;
}

export async function cli(args: Array<string>, cli: CliOptions): Promise<void> {
  const { env, stdio } = cli;
  const { stdout } = stdio;
  const options = parseArgs(args, env);
  if (options && options.help) {
    await printUsage(stdout, env);
    return;
  }
  if (options && options.version) {
    await printVersion(stdout);
    return;
  }
  if (!options || !options.command) {
    await printUsage(stdout, env);
    throw null;
  }

  dynamicRequire.initialize();

  if (options.enterprise) {
    process.env.AG_PREFER_ENTERPRISE_IMPORTS = 'true';
  }

  const task = match(options.command, {
    Migrate: ({ args }) => migrate(args, cli),
  });
  await task;
}

function parseArgs(args: string[], env: CliEnv): Args {
  const options: Args = {
    command: null,
    version: false,
    help: false,
    enterprise: false,
  };
  while (args.length > 0) {
    const arg = args.shift()!;
    switch (arg) {
      case '--version':
      case '-v':
        options.version = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--prefer-enterprise':
      case '-p':
        options.enterprise = true;
        break;
      case 'migrate': {
        options.command = CliCommand.Migrate({
          args: parseMigrateCommandArgs(args, env),
        });
        break;
      }
      default:
        throw new CliArgsError(`Unexpected argument: ${arg}`, usage(env));
    }
  }
  return options;
}

function printUsage(output: WritableStream, env: CliEnv): Promise<void> {
  return log(output, usage(env));
}

function printVersion(output: WritableStream): Promise<void> {
  return log(output, require('./package.json').version);
}
