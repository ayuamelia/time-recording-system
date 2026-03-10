import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

/**
 * Creates a user directly in the DB and returns a valid JWT for them.
 */
export async function createUserAndLogin(
  overrides: { role?: 'admin' | 'employee'; email?: string } = {}
) {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: overrides.email ?? 'test@example.com',
      passwordHash,
      role: overrides.role ?? 'employee',
    },
  });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: user.email, password: 'password123' });

  return { user, token: res.body.data.token as string };
}

/**
 * Convenience: makes an authenticated request helper bound to a token.
 */
export function authedRequest(token: string) {
  return {
    get: (url: string) =>
      request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) =>
      request(app).post(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) =>
      request(app).patch(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) =>
      request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) =>
      request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}