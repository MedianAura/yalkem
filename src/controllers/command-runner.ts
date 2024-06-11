import chalk from 'chalk';
import { cosmiconfig, type CosmiconfigResult } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import Enquirer from 'enquirer';
import { execaCommand } from 'execa';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sprintf } from 'sprintf-js';
import type { Primitive } from 'zod';
import { Logger } from '../helpers/logger.js';
import type { AutomatonConfigModel, AutomatonPromptFunction, AutomatonPromptResult } from '../models/automaton.js';
import { ConfigurationNotFoundError } from '../models/errors.js';

export class CommandRunner {
  public async run(jobName: string | undefined, answerFile: string | undefined): Promise<void> {

  }
}
