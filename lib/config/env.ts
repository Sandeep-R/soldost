import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Missing Supabase anon key'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'Missing Supabase service key'),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().min(1, 'Missing Anthropic API key'),
  LLM_PROVIDER: z.enum(['anthropic', 'openai']).default('anthropic'),
  LLM_MODEL: z.string().default('claude-3-5-sonnet-20241022'),

  // WhatsApp Bot
  WHATSAPP_SESSION_NAME: z.string().default('soldost-bot'),
  BOT_PHONE_NUMBER: z.string().optional(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').pipe(z.coerce.number()),
  TIMEZONE: z.string().default('UTC'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Feature Flags
  ENABLE_BAILEYS_BOT: z
    .string()
    .default('true')
    .pipe(z.coerce.boolean()),
  ENABLE_SCHEDULER: z
    .string()
    .default('true')
    .pipe(z.coerce.boolean()),
  ENABLE_DASHBOARD: z
    .string()
    .default('true')
    .pipe(z.coerce.boolean()),

  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${errors}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export const env = getEnv();
