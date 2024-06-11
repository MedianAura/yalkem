import { readPackageSync } from 'read-pkg';
import { program } from '@commander-js/extra-typings';
import { createGlobalPackageCommand } from './commands/global.js';
import { createLocalPackageCommand } from './commands/local.js';
import { createPurgeCommand } from './commands/purge.js';
import { createRestoreCommand } from './commands/restore.js';
import { handleError } from './helpers/handle-error.js';
import { Logger } from './helpers/logger.js';

const packageJSON = readPackageSync();

program
  .name(packageJSON.name)
  .description(packageJSON.description ?? '')
  .version(packageJSON.version);

program.addCommand(createGlobalPackageCommand());
program.addCommand(createLocalPackageCommand());
program.addCommand(createPurgeCommand());
program.addCommand(createRestoreCommand());

export async function run(): Promise<number> {
  Logger.clear();
  Logger.title('Yalkem CLI - Yalc Package Manager');

  try {
    await program.parseAsync();
  } catch (error: unknown) {
    return handleError(error);
  }

  return 0;
}
