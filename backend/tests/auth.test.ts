import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock prisma before importing anything else
const mockUser = { id: 1, name: 'Test User', email: 't@test.com', role: 'user', passwordHash: 'hashed' };

await jest.unstable_mockModule('../src/prisma.js', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(async ({ where }: any) => {
          // support queries by email or by id for tests
          if (where.email === mockUser.email) return mockUser;
          if (where.id === mockUser.id) return mockUser;
          return null;
        }),
        create: jest.fn(async ({ data }: any) => ({ id: 2, ...data, role: 'user' })),
        update: jest.fn(async ({ where, data }: any) => ({ ...mockUser, ...data })),
      },
    },
  };
});

// Mock email utilities
// Mock email utilities (ensure ESM-safe path)
await jest.unstable_mockModule('../src/utils/email.js', () => ({
  sendPasswordResetEmail: jest.fn(async () => {}),
  sendEventRegistrationEmail: jest.fn(async () => {}),
}));

// Import app after mocks are set up
// Import app after mocks are set up (ESM dynamic import)
const { default: app } = await import('../src/index.js');

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 with token on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ 
        name: 'New User', 
        email: 'new@test.com', 
        password: 'secret123', 
        confirmPassword: 'secret123', 
        mobile: '1234567890' 
      });
    
    // debug on failure
    if (res.status !== 201) console.error('REGISTER ERROR:', res.status, JSON.stringify(res.body));
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'new@test.com');
  });

  it('returns 401 when logging in with invalid credentials', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: mockUser.email, password: 'wrong' });
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('succeeds login with correct password', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: mockUser.email, password: 'right' });
    
    if (res.status !== 200) console.error('LOGIN ERROR:', res.status, JSON.stringify(res.body));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET as string) as any;
    expect(decoded).toHaveProperty('email', mockUser.email);
  });

  it('reset-request returns success message', async () => {
    const res = await request(app)
      .post('/api/auth/reset-request')
      .send({ email: mockUser.email });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('reset endpoint works with valid token', async () => {
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    const res = await request(app)
      .post('/api/auth/reset')
      .send({ token, password: 'newpass123' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});