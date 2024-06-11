import { Command } from '@commander-js/extra-typings';

export function createRestoreCommand(): Command {
  const restore = new Command('restore');

  restore
    .command('list', { isDefault: true })
    .description('list yalkem available packages.')
    .action(() => {

    });

  return restore;
}
