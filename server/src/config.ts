import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  port: parseInt(optional('PORT', '3001'), 10),
  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),
  gemini: {
    apiKey: required('GEMINI_API_KEY'),
  },
  daily: {
    apiKey: optional('DAILY_API_KEY', ''),
  },
  redis: {
    url: optional('UPSTASH_REDIS_REST_URL', ''),
    token: optional('UPSTASH_REDIS_REST_TOKEN', ''),
  },
  supabase: {
    url: optional('SUPABASE_URL', ''),
    serviceKey: optional('SUPABASE_SERVICE_KEY', ''),
  },
};
