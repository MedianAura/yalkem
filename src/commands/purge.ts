import { spawnSync } from 'node:child_process';
import { Command } from '@commander-js/extra-typings';
import { Logger } from '../helpers/logger.js';

export function createPurgeCommand(): Command {
  const purge = new Command('purge');

  purge.description('purge locally installed yalc packages.').action(async () => {
    const cwd = process.cwd();

    Logger.info('Purging locally installed yalc packages.');

    let result = spawnSync('yalc', ['remove', '--all'], { cwd });
    if (result.status !== 0) {
      throw new Error('Failed to remove all yalc packages.');
    }

    result = spawnSync('rm', ['-rf', '.yalc'], { cwd });
    if (result.status !== 0) {
      throw new Error('Failed to remove .yalc directory.');
    }

    result = spawnSync('rm', ['yalc.lock'], { cwd });
    if (result.status !== 0) {
      console.error(result.stderr.toString());
      throw new Error('Failed to remove yalc.lock file.');
    }

    result = spawnSync('yalc', ['installations', 'clean'], { cwd });
    if (result.status !== 0) {
      throw new Error('Failed to clean yalc installations.');
    }

    Logger.success('Purge completed successfully.');
  });

  return purge;
}
