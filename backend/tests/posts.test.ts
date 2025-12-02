import { jest } from '@jest/globals';
// Reset module registry to ensure mocks are isolated when running tests in sequence
jest.resetModules();
import request from 'supertest';

const mockPosts = [
  { id: 1, title: 'p1', description: 'd1', imageUrl: null, authorId: 1, author: { id: 1, name: 'A' } },
];

await jest.unstable_mockModule('../src/prisma.js', () => ({
  prisma: {
    post: {
      findMany: jest.fn(async () => mockPosts),
      findUnique: jest.fn(async ({ where: { id } }) => mockPosts.find(p => p.id === id)),
      create: jest.fn(async ({ data }) => ({ id: 2, ...data })),
      update: jest.fn(async ({ where: { id }, data }) => ({ id, ...data })),
      delete: jest.fn(async ({ where: { id } }) => ({ id })),
    }
  }
}));

const { default: app } = await import('../src/index.js');

// simple token with role and id for auth-protected endpoints
import jwt from 'jsonwebtoken';
const token = jwt.sign({ id: 1, email: 'a@b.com', role: 'user' }, process.env.JWT_SECRET as string);

describe('Posts API', () => {
  it('GET /api/posts returns posts', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/posts requires auth', async () => {
    const res = await request(app).post('/api/posts').send({ title: 'new', description: 'hey' });
    expect(res.status).toBe(401);
  });

  it('POST /api/posts with auth returns created', async () => {
      const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${token}`).send({ title: 'new', description: 'This is a valid description for the test' });
    expect(res.status === 201 || res.status === 200).toBe(true);
  });

  it('PUT /api/posts/:id updates post', async () => {
    const res = await request(app).put('/api/posts/1').set('Authorization', `Bearer ${token}`).send({ title: 'updated', description: 'updated' });
    expect(res.status === 200 || res.status === 204).toBeTruthy();
  });

  it('DELETE /api/posts/:id deletes post', async () => {
    const res = await request(app).delete('/api/posts/1').set('Authorization', `Bearer ${token}`);
    expect([200,204,204].includes(res.status)).toBeTruthy();
  });
});
