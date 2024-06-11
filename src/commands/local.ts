import { execaSync } from 'execa';
import { Command } from '@commander-js/extra-typings';
import { checkbox } from '@inquirer/prompts';
import { getConfiguration } from '../helpers/config.js';
import { getLocalConfiguration, updateLocalConfiguration } from '../helpers/local-configuration.js';
import { Logger } from '../helpers/logger.js';

export function createLocalPackageCommand(): Command {
  const local = new Command('local');

  local.description('setup local package.').action(async () => {
    Logger.info('Setup local package.');

    const cwd = process.cwd();
    const localPackages = getLocalConfiguration();
    const packages = getConfiguration().get('packages') ?? [];

    const answers = await checkbox({
      message: 'Select packages to add: ',
      choices: packages.map((name) => ({ name, value: name, checked: localPackages[name] ?? false })),
    });

    for (const name of answers) {
      localPackages[name] = true;
    }

    for (const packageName in localPackages) {
      localPackages[packageName] = false;

      if (answers.includes(packageName)) {
        localPackages[packageName] = true;

        const result = execaSync('yalc', ['add', packageName], { cwd, windowsVerbatimArguments: true, stdio: 'inherit' });
        if (result.exitCode !== 0) {
          throw new Error(`Failed to add package <${packageName}>`);
        }
      }
    }

    updateLocalConfiguration(localPackages);
    Logger.success('Local package added successfully.');
  });

  return local;
}
