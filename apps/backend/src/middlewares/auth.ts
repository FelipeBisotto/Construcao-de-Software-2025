import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../config/env';

type AuthPayload = JWTPayload & {
  roles?: string[];
  scope?: string;
  'cognito:groups'?: string[] | string;
};

type AuthenticatedRequest = Request & { user?: AuthPayload };

let jwksUriCache: string | null = null;
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getRemoteJwks() {
  const currentUri = env.JWKS_URI;
  if (!jwks || jwksUriCache !== currentUri) {
    jwks = createRemoteJWKSet(new URL(currentUri));
    jwksUriCache = currentUri;
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
  return payload as AuthPayload;
}

function ensureUser(req: Request) {
  return (req as AuthenticatedRequest).user;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });
    const payload = await verifyToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = ensureUser(req);
    if (!user) return res.status(401).json({ error: 'Missing user context' });
    const userRoles = extractRoles(user);
    if (!roles.some((role) => userRoles.includes(role))) {
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
