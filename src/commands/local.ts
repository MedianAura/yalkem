import { existsSync } from 'node:fs';
import path from 'node:path';
import { Command } from '@commander-js/extra-typings';
import { __os_appdata_path } from '@spongex/os-appdata-path';
import { checkbox } from '@inquirer/prompts';
import { getConfiguration } from '../helpers/config.js';
import { Logger } from '../helpers/logger.js';

export function createPackageCommand(): Command {
  const packages = new Command('packages');

  packages
    .command('list', { isDefault: true })
    .description('list yalkem available packages.')
    .action(() => {
      Logger.info('List Packages : ');
      Logger.println('============================');

      const packages = getConfiguration().get('packages');

      if (packages?.length > 0) {
        for (const pack of getConfiguration().get('packages')) {
          Logger.print(`- ${pack}`);
        }
      } else {
        Logger.warn('No managed packages.');
      }
    });

  packages
    .command('add')
    .description('add package to yalkem.')
    .argument('<name>', 'name of the yalc package to add.')
    .action((name) => {
      const libraryPath = path.join(__os_appdata_path ?? '', 'Yalc/packages', name);

      if (!existsSync(libraryPath)) {
        throw new Error(`Directory <${libraryPath}> not found. Make sure to yalc publish the package first.`);
      }

      const packages = getConfiguration().get('packages') ?? [];
      const index = packages.indexOf(name);

      if (index !== -1) {
        throw new Error('Package already added.');
      }

      packages.push(name);
      getConfiguration().set('packages', packages);

      Logger.success('Package added successfully.');
    });

  packages
    .command('remove')
    .description('remove package from yalkem.')
    .action(async () => {
      const packages = getConfiguration().get('packages') ?? [];

      const answers = await checkbox({
        message: 'Select a package manager',
        choices: packages.map((name) => ({ name, value: name })),
      });

      if (answers.length === 0) {
        throw new Error('No package selected.');
      }

      for (const name of answers) {
        packages.splice(packages.indexOf(name), 1);
      }

      getConfiguration().set('packages', packages);

      Logger.success('Package removed successfully.');
    });

  return packages;
}
