import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
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
  return jwks;
}

function extractRoles(payload: AuthPayload): string[] {
  const fromRoles = Array.isArray(payload.roles) ? payload.roles : [];
  const groupsClaim = payload['cognito:groups'];
  const fromGroups = Array.isArray(groupsClaim)
    ? groupsClaim
    : typeof groupsClaim === 'string'
      ? groupsClaim.split(',')
      : [];
  const fromScope = typeof payload.scope === 'string' ? payload.scope.split(' ') : [];

  return Array.from(new Set([...fromRoles, ...fromGroups, ...fromScope]));
}

async function verifyToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, getRemoteJwks(), {
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

export function requireSelfOrRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = ensureUser(req);
    if (!user) return res.status(401).json({ error: 'Missing user context' });
    const userId = user.sub;
    const requestedId = req.params.id;
    const userRoles = extractRoles(user);

    if (requestedId && userId && requestedId === userId) {
      return next();
    }

    if (roles.some((role) => userRoles.includes(role))) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
  };
}
