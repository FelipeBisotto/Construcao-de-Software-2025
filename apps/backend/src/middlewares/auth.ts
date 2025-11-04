import { NextFunction, Request, Response } from 'express';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { env } from '../config/env';

interface Payload {
  sub: string;
  scope: string;
  roles: string[];
  'cognito:groups'?: string[];
}

interface AuthenticatedRequest extends Request {
  user?: Payload;
}

async function verifyToken(token: string): Promise<Payload> {
  if (!env.JWKS_URI || !env.JWT_ISSUER || !env.JWT_AUDIENCE) {
    // Dev fallback: aceita token em branco — NÃO usar em produção
    return { sub: 'dev', scope: 'user', roles: ['user'] } as Payload;
  }
  const JWKS = createRemoteJWKSet(new URL(env.JWKS_URI));
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  });
  return payload as Payload;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });
    const payload = await verifyToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (e: unknown) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    const userRoles: string[] = user?.roles || user?.['cognito:groups'] || [];
    if (!userRoles || !roles.some((r) => userRoles.includes(r))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

