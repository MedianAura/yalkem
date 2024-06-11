import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const localConfigurationPath = path.resolve(process.cwd(), '.yalkemrc');

function readConfigurationFile(): Record<string, boolean> {
  try {
    const configuration = readFileSync(localConfigurationPath, { encoding: 'utf8' });
    return JSON.parse(configuration);
  } catch {
    return {};
  }
}

export function getLocalConfiguration(): Record<string, boolean> {
  return readConfigurationFile();
}

export function updateLocalConfiguration(configuration: Record<string, boolean>): void {
  const currentConfiguration = getLocalConfiguration();
  const configurationString = JSON.stringify({ ...currentConfiguration, ...configuration }, undefined, 2);

  writeFileSync(localConfigurationPath, configurationString, { encoding: 'utf8' });
}
