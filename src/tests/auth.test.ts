import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../config/database';

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        passwordHash: await bcrypt.hash('secret123', 10),
        role: 'employee',
      },
    });
  });

  it('returns a JWT on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@example.com' }); // no password

    expect(res.status).toBe(400);
  });

  it('returns 401 when calling a protected route without token', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(401);
  });
});