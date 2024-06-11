import { execaSync } from 'execa';
import { Command } from '@commander-js/extra-typings';
import { Logger } from '../helpers/logger.js';

export function createPurgeCommand(): Command {
  const purge = new Command('purge');

  purge.description('purge locally installed yalc packages.').action(async () => {
    const cwd = process.cwd();

    Logger.info('Purging locally installed yalc packages.');

    let result = execaSync('yalc', ['remove', '--all'], { cwd });
    if (result.code !== 0) {
      throw new Error('Failed to remove all yalc packages.');
    }

    result = execaSync('yalc', ['installations', 'clean'], { cwd });
    if (result.code !== 0) {
      throw new Error('Failed to clean yalc installations.');
    }

    Logger.success('Purge completed successfully.');
  });

  return purge;
}
