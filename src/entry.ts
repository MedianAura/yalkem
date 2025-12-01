import 'reflect-metadata';

import { config } from 'dotenv-flow';
config();

export async function run(): Promise<number> {
  const program = await import('./main.js');
  return program.run();
}
