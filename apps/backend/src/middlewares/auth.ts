import type { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '../config/env.js';

async function verifyToken(token: string) {
  if (!env.JWKS_URI || !env.JWT_ISSUER || !env.JWT_AUDIENCE) {
    // Dev fallback: aceita token em branco — NÃO usar em produção
    return { sub: 'dev', scope: 'user', roles: ['user'] } as any;
  }
  const JWKS = createRemoteJWKSet(new URL(env.JWKS_URI));
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
  return payload as any;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });
    const payload = await verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (e: any) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: any = (req as any).user;
    const userRoles: string[] = user?.roles || user?.['cognito:groups'] || [];
    if (!userRoles || !roles.some((r) => userRoles.includes(r))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

