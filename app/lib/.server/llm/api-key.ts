import { env } from 'node:process';

export type Provider = 'anthropic' | 'google';

export function getAPIKey(cloudflareEnv: Env, provider: Provider = 'anthropic') {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  if (provider === 'google') {
    return env.GOOGLE_API_KEY || cloudflareEnv.GOOGLE_API_KEY;
  }
  return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
}
