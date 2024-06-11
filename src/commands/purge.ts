import { detect } from 'detect-package-manager';
import { execaSync } from 'execa';
import { Command } from '@commander-js/extra-typings';
import { confirm } from '@inquirer/prompts';
import { Logger } from '../helpers/logger.js';

export function createPurgeCommand(): Command {
  const purge = new Command('purge');

  purge.description('purge locally installed yalc packages.').action(async () => {
    const cwd = process.cwd();

    Logger.info('Purging locally installed yalc packages.');

    let result = execaSync('yalc', ['remove', '--all'], { cwd });
    if (result.exitCode !== 0) {
      throw new Error('Failed to remove all yalc packages.');
    }

    result = execaSync('yalc', ['installations', 'clean'], { cwd });
    if (result.exitCode !== 0) {
      throw new Error('Failed to clean yalc installations.');
    }

    const installDependencies = await confirm({
      message: 'Do you want to install dependencies?',
      default: true,
    });

    if (!installDependencies) {
      Logger.success('Purge completed successfully. (Skipping installation)');
      return;
    }

    const pm = await detect();
    if (pm === 'npm') {
      execaSync('npm', ['install'], { cwd });
    } else if (pm === 'yarn') {
      execaSync('yarn', [], { cwd });
    } else {
      throw new Error('Failed to detect package manager.');
    }

    Logger.success('Purge completed successfully.');
  });

  return purge;
}
