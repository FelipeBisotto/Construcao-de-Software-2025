import http from 'http';
import type { AddressInfo } from 'net';
import request from 'supertest';
import { SignJWT, generateKeyPair, exportJWK, type JWK, type KeyLike } from 'jose';
import { prisma } from '../src/db';

const ISSUER = 'https://auth.example.com';
const AUDIENCE = 'test-client';
const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const USER_ID = '00000000-0000-0000-0000-000000000002';

let privateKey!: KeyLike;
let jwk!: JWK;
let app!: import('express').Express;
let jwksServer!: http.Server;

async function issueToken(options: {
  sub: string;
  roles?: string[];
  groups?: string[];
  audience?: string;
}) {
  const payload: Record<string, unknown> = {
    sub: options.sub
  };

  if (options.roles) payload.roles = options.roles;
  if (options.groups) payload['cognito:groups'] = options.groups;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid: jwk.kid as string })
    .setIssuer(ISSUER)
    .setAudience(options.audience ?? AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
}

beforeAll(async () => {
  const { publicKey, privateKey: pk } = await generateKeyPair('RS256');
  privateKey = pk;
  jwk = await exportJWK(publicKey);
  jwk.kid = jwk.kid ?? 'test-kid';
  jwk.use = 'sig';
  jwk.alg = 'RS256';

  jwksServer = http.createServer((req, res) => {
    if (req.url === '/.well-known/jwks.json') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ keys: [jwk] }));
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  await new Promise<void>((resolve) => jwksServer.listen(0, '127.0.0.1', resolve));

  const { port } = jwksServer.address() as AddressInfo;

  process.env.JWT_ISSUER = ISSUER;
  process.env.JWT_AUDIENCE = AUDIENCE;
  process.env.JWKS_URI = `http://127.0.0.1:${port}/.well-known/jwks.json`;

  jest.resetModules();
  app = (await import('../src/server')).default;
});

afterAll(async () => {
  await prisma.$disconnect();
  await new Promise<void>((resolve) => jwksServer.close(() => resolve()));
  jest.resetModules();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      {
        id: ADMIN_ID,
        name: 'Admin Test',
        email: 'admin@test.dev',
        role: 'admin'
      },
      {
        id: USER_ID,
        name: 'User Test',
        email: 'user@test.dev',
        role: 'user'
      }
    ]
  });
});

describe('JWT RBAC', () => {
  it('rejects missing bearer token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('rejects invalid audience', async () => {
    const token = await issueToken({ sub: ADMIN_ID, roles: ['admin'], audience: 'wrong' });
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('allows admin to list users', async () => {
    const token = await issueToken({ sub: ADMIN_ID, roles: ['admin'] });
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('blocks regular user from listing all users', async () => {
    const token = await issueToken({ sub: USER_ID, roles: ['user'], groups: ['user'] });
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows owner to get own record', async () => {
    const token = await issueToken({ sub: USER_ID, roles: ['user'], groups: ['user'] });
    const res = await request(app).get(`/api/users/${USER_ID}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(USER_ID);
  });

  it('blocks user from accessing other user data', async () => {
    const token = await issueToken({ sub: USER_ID, roles: ['user'], groups: ['user'] });
    const res = await request(app).get(`/api/users/${ADMIN_ID}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('allows admin to delete user', async () => {
    const token = await issueToken({ sub: ADMIN_ID, roles: ['admin'] });
    const res = await request(app)
      .delete(`/api/users/${USER_ID}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    const remaining = await prisma.user.findMany();
    expect(remaining).toHaveLength(1);
  });
});
