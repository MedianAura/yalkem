import { readPackageSync } from 'read-pkg';
import { program } from '@commander-js/extra-typings';
import { handleError } from './helpers/handle-error.js';
import { Logger } from './helpers/logger.js';
import { createPackageCommand } from './commands/packages.js';

const packageJSON = readPackageSync();

program
  .name(packageJSON.name)
  .description(packageJSON.description ?? '')
  .version(packageJSON.version);

program.addCommand(createPackageCommand());

program.command('install');

program.command('remove');

program.command('purge');

program.command('restore');

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
