import * as dotenv from 'dotenv';
dotenv.config();

function get(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/app?schema=public'),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  JWT_ISSUER: process.env.JWT_ISSUER ?? '',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE ?? '',
  JWKS_URI: process.env.JWKS_URI ?? ''
};

