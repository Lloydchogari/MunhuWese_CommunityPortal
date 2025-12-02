import { jest } from '@jest/globals';
jest.resetModules();
import request from 'supertest';

const now = new Date();
const mockEvents = [
  { id: 1, title: 'evt1', description: 'A valid event description for testing', location: 'here', startAt: now, endAt: new Date(now.getTime()+3600000) },
];

await jest.unstable_mockModule('../src/prisma.js', () => ({
  prisma: {
    event: {
      findMany: jest.fn(async () => mockEvents),
      findUnique: jest.fn(async ({ where: { id } }) => mockEvents.find(e => e.id === id)),
      create: jest.fn(async ({ data }) => ({ id: 2, ...data })),
      update: jest.fn(async ({ where: { id }, data }) => ({ id, ...data })),
      delete: jest.fn(async ({ where: { id } }) => ({ id })),
    },
    user: {
      findUnique: jest.fn(async ({ where: { id } }) => ({ id, name: 'Test User', email: 'a@b.com' })),
    },
    eventRegistration: {
      findUnique: jest.fn(async ({ where }) => null),
      create: jest.fn(async ({ data }) => ({ id: 1, ...data })),
    }
  }
}));

await jest.unstable_mockModule('../src/utils/email.js', () => ({
  sendEventRegistrationEmail: jest.fn(async () => {})
}));

const { default: app } = await import('../src/index.js');
import jwt from 'jsonwebtoken';
const token = jwt.sign({ id: 1, email: 'a@b.com', role: 'user' }, process.env.JWT_SECRET as string);

describe('Events API', () => {
  it('GET /api/events returns events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/events requires admin role', async () => {
    const res = await request(app).post('/api/events').set('Authorization', `Bearer ${token}`).send({ title: 'x' });
    expect(res.status).toBe(403);
  });

  it('POST /api/events with admin creates', async () => {
    const adminToken = jwt.sign({ id: 9, email: 'admin@test', role: 'admin' }, process.env.JWT_SECRET as string);
    const res = await request(app).post('/api/events').set('Authorization', `Bearer ${adminToken}`).send({ title: 'Test Event', description: 'This is a longer description for the event', location: 'l', startAt: new Date().toISOString(), endAt: new Date(Date.now()+3600000).toISOString() });
    expect([201,200].includes(res.status)).toBeTruthy();
  });

  it('POST /api/events/:id/register requires auth', async () => {
    const res = await request(app).post('/api/events/1/register');
    expect(res.status).toBe(401);
  });

  it('POST /api/events/:id/register succeeds for authenticated user', async () => {
    const res = await request(app).post('/api/events/1/register').set('Authorization', `Bearer ${token}`);
    expect([201,200].includes(res.status)).toBeTruthy();
  });
});
