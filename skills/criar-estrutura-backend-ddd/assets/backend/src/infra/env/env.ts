import z from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3000),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  CORS_ORIGINS: z.string().optional().default('*'),
});

export type Env = z.infer<typeof envSchema>;
