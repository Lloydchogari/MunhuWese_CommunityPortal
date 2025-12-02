import { jest } from '@jest/globals';
import request from 'supertest';

// Prevent real Prisma usage in this simple root test
await jest.unstable_mockModule('../src/prisma.js', () => ({ prisma: {} }));
const { default: app } = await import('../src/index.js');

describe('Backend root', () => {
  it('GET / returns OK JSON', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});
