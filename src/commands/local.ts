import { spawnSync } from 'node:child_process';
import { Command } from '@commander-js/extra-typings';
import { checkbox } from '@inquirer/prompts';
import { getConfiguration } from '../helpers/config.js';
import { getLocalConfiguration, updateLocalConfiguration } from '../helpers/local-configuration.js';
import { Logger } from '../helpers/logger.js';

export function createLocalPackageCommand(): Command {
  const local = new Command('local');

  local
    .command('add')
    .description('add local package.')
    .action(async () => {
      Logger.info('Adding local package.');

      const cwd = process.cwd();
      const localPackages = Object.keys(getLocalConfiguration());
      const packages = (getConfiguration().get('packages') ?? []).filter((name) => !localPackages.includes(name));

      const answers = await checkbox({
        message: 'Select packages to add: ',
        choices: packages.map((name) => ({ name, value: name })),
      });

      for (const name of answers) {
        const result = spawnSync('yalc', ['add', name], { cwd });
        if (result.status !== 0) {
          throw new Error(`Failed to add package <${name}>`);
        }
      }

      Logger.success('Local package added successfully.');
    });

  local
    .command('remove')
    .description('remove local package.')
    .action(async () => {
      Logger.info('Removing local package.');

      const localPackages = getLocalConfiguration();

      const answers = await checkbox({
        message: 'Select packages to remove: ',
        choices: Object.keys(localPackages).map((name) => ({ name, value: name })),
      });

      for (const name of answers) {
        delete localPackages[name];
      }

      updateLocalConfiguration(localPackages);

      Logger.success('Local package added successfully.');
    });

  return local;
}
