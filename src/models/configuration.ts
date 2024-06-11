import z from 'zod';

const ConfigurationModel = z
  .object({
    packages: z.array(z.string()).default([]),
  })
  .required()
  .strict();

export type ConfigurationModelSchema = z.infer<typeof ConfigurationModel>;
