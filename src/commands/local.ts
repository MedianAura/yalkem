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
      const localPackages = getLocalConfiguration();
      const listLocalPackages = Object.keys(localPackages);
      const packages = (getConfiguration().get('packages') ?? []).filter((name) => !listLocalPackages.includes(name));

      const answers = await checkbox({
        message: 'Select packages to add: ',
        choices: packages.map((name) => ({ name, value: name })),
      });

      for (const name of answers) {
        const result = spawnSync('yalc', ['add', name], { cwd, windowsVerbatimArguments: true, stdio: 'inherit' });
        if (result.status !== 0) {
          console.error(result.stdout?.toString());
          console.error(result.stderr?.toString());
          throw new Error(`Failed to add package <${name}>`);
        }

        localPackages[name] = true;
      }

      updateLocalConfiguration(localPackages);
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
