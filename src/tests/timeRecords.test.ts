import { createUserAndLogin, authedRequest } from './helpers';
import prisma from '../config/database';

describe('Time Records CRUD', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.workConfig.create({
      data: {
        normalHoursPerDay: 8,
        workingDaysOfWeek: JSON.stringify([1, 2, 3, 4, 5]),
        effectiveFrom: new Date(),
      },
    });
    const result = await createUserAndLogin();
    token = result.token;
    userId = result.user.id;
  });

  it('creates a time record manually', async () => {
    const res = await authedRequest(token)
      .post('/api/v1/time-records')
      .send({
        userId,
        clockIn: '2024-03-14T09:00:00Z',
        clockOut: '2024-03-14T17:00:00Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.workedMinutes).toBe(480);
    expect(res.body.data.overtimeMinutes).toBe(0);
  });

  it('computes overtime correctly', async () => {
    const res = await authedRequest(token)
      .post('/api/v1/time-records')
      .send({
        userId,
        clockIn: '2024-03-14T09:00:00Z',
        clockOut: '2024-03-14T18:30:00Z', // 9.5 h → 1.5 h overtime
      });

    expect(res.status).toBe(201);
    expect(res.body.data.workedMinutes).toBe(570);
    expect(res.body.data.overtimeMinutes).toBe(90);
  });

  it('rejects clockOut before clockIn', async () => {
    const res = await authedRequest(token)
      .post('/api/v1/time-records')
      .send({
        userId,
        clockIn: '2024-03-14T17:00:00Z',
        clockOut: '2024-03-14T09:00:00Z',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must be after/i);
  });

  it('reads a single record', async () => {
    const created = await authedRequest(token)
      .post('/api/v1/time-records')
      .send({ userId, clockIn: '2024-03-14T09:00:00Z' });

    const res = await authedRequest(token)
      .get(`/api/v1/time-records/${created.body.data.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(created.body.data.id);
  });

  it('lists and paginates records', async () => {
  for (let i = 9; i <= 11; i++) {
    const day = String(i).padStart(2, '0');
    await authedRequest(token)
      .post('/api/v1/time-records')
      .send({ userId, clockIn: `2024-03-${day}T09:00:00Z` });
  }

  const res = await authedRequest(token)
    .get(`/api/v1/time-records?userId=${userId}&limit=2&page=1`);

  expect(res.status).toBe(200);
  expect(res.body.data.records).toHaveLength(2);
  expect(res.body.data.total).toBe(3);
  expect(res.body.data.totalPages).toBe(2);
});

  it('updates a record', async () => {
    const created = await authedRequest(token)
      .post('/api/v1/time-records')
      .send({ userId, clockIn: '2024-03-14T09:00:00Z' });

    const res = await authedRequest(token)
      .patch(`/api/v1/time-records/${created.body.data.id}`)
      .send({ clockOut: '2024-03-14T17:00:00Z', notes: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.workedMinutes).toBe(480);
    expect(res.body.data.notes).toBe('Updated');
  });

  it('deletes a record', async () => {
    const created = await authedRequest(token)
      .post('/api/v1/time-records')
      .send({ userId, clockIn: '2024-03-14T09:00:00Z' });

    const del = await authedRequest(token)
      .delete(`/api/v1/time-records/${created.body.data.id}`);
    expect(del.status).toBe(200);

    const get = await authedRequest(token)
      .get(`/api/v1/time-records/${created.body.data.id}`);
    expect(get.status).toBe(404);
  });
});