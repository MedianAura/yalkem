import { execaSync } from 'execa';
import { Command } from '@commander-js/extra-typings';
import { getLocalConfiguration } from '../helpers/local-configuration.js';
import { Logger } from '../helpers/logger.js';

export function createRestoreCommand(): Command {
  const restore = new Command('restore');

  restore.description('restore yalc package from configuration.').action(() => {
    Logger.info('Restoring yalc package from configuration.');

    const cwd = process.cwd();
    const localPackages = getLocalConfiguration();
    const activePackages = Object.entries(localPackages).filter(([, value]) => value);

    if (!activePackages || activePackages.length === 0) {
      throw new Error('No active package found.');
    }

    for (const [name] of activePackages) {
      const result = execaSync('yalc', ['add', name], { cwd });
      if (result.exitCode !== 0) {
        throw new Error(`Failed to restore package <${name}>`);
      }
    }

    Logger.success('Restore completed successfully.');
  });

  return restore;
}
