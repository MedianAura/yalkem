import { Command } from '@commander-js/extra-typings';

export function createRestoreCommand(): Command {
  const restore = new Command('restore');

  restore
    .description('list yalkem available packages.')
    .action(() => {});

  return restore;
}
