import * as dotenv from 'dotenv';
dotenv.config();

function get(name: string, fallback?: string) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing env var ${name}`);
  }
  return raw;
}

export const env = {
  get NODE_ENV() {
    return process.env.NODE_ENV ?? 'development';
  },
  get PORT() {
    return Number(process.env.PORT ?? 3000);
  },
  get DATABASE_URL() {
    return get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/app?schema=public');
  },
  get CORS_ORIGIN() {
    return process.env.CORS_ORIGIN ?? '*';
  },
  get JWT_ISSUER() {
    return get('JWT_ISSUER');
  },
  get JWT_AUDIENCE() {
    return get('JWT_AUDIENCE');
  },
  get JWKS_URI() {
    return get('JWKS_URI');
  }
};
