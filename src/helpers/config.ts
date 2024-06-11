import Conf from 'conf';
import type { ConfigurationModelSchema } from '../models/configuration.js';

const config = new Conf<ConfigurationModelSchema>({ projectName: 'yalkem' });

export function getConfiguration(): Conf<ConfigurationModelSchema> {
  return config;
}
