import { createUserAndLogin, authedRequest } from './helpers';
import prisma from '../config/database';

describe('Reports', () => {
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

  it('returns correct aggregate totals', async () => {
    // Day 1: 8 h exactly (no overtime)
    await authedRequest(token).post('/api/v1/time-records').send({
      userId,
      clockIn: '2024-03-11T09:00:00Z',
      clockOut: '2024-03-11T17:00:00Z',
    });

    // Day 2: 10 h (2 h overtime)
    await authedRequest(token).post('/api/v1/time-records').send({
      userId,
      clockIn: '2024-03-12T09:00:00Z',
      clockOut: '2024-03-12T19:00:00Z',
    });

    const res = await authedRequest(token)
      .get(`/api/v1/reports?userId=${userId}&from=2024-03-11&to=2024-03-12`);

    expect(res.status).toBe(200);
    expect(res.body.data.aggregateTotalWorkedMinutes).toBe(1080); // 18 h
    expect(res.body.data.aggregateTotalOvertimeMinutes).toBe(120); // 2 h
  });

  it('includes non-working days in daily totals', async () => {
    const res = await authedRequest(token)
      .get(`/api/v1/reports?userId=${userId}&from=2024-03-09&to=2024-03-10`); // Sat + Sun

    expect(res.status).toBe(200);
    expect(res.body.data.totalWorkingDays).toBe(0);
    res.body.data.dailyTotals.forEach((day: { isWorkingDay: boolean }) => {
      expect(day.isWorkingDay).toBe(false);
    });
  });

  it('returns 400 when userId is missing', async () => {
    const res = await authedRequest(token)
      .get('/api/v1/reports?from=2024-03-01&to=2024-03-31');

    expect(res.status).toBe(400);
  });
});