import request from 'supertest';

process.env.JWT_ISSUER = process.env.JWT_ISSUER || 'https://health-check.local';
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'health-audience';
process.env.JWKS_URI = process.env.JWKS_URI || 'https://example.com/jwks.json';

import app from '../src/server.js';

describe('health', () => {
  it('should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
