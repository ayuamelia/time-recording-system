import prisma from "../config/database";
import { createUserAndLogin, authedRequest } from "./helpers";

describe("Clock In / Out", () => {
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

    const { user, token: t } = await createUserAndLogin();
    token = t;
    userId = user.id;
  });

  it("clocks in successfully", async () => {
    const res = await authedRequest(token)
      .post("/api/v1/clock/in")
      .send({ userId });

    expect(res.status).toBe(201);
    expect(res.body.data.clockOut).toBeNull();
    expect(res.body.data.workedMinutes).toBeNull();
  });

  it("prevents double clock-in", async () => {
    await authedRequest(token).post("/api/v1/clock/in").send({ userId });

    const res = await authedRequest(token)
      .post("/api/v1/clock/in")
      .send({ userId });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already clocked in/i);
  });

  it("clocks out and computes workedMinutes", async () => {
    await authedRequest(token).post("/api/v1/clock/in").send({ userId });

    const res = await authedRequest(token)
      .post("/api/v1/clock/out")
      .send({ userId });

    expect(res.status).toBe(200);
    expect(res.body.data.clockOut).not.toBeNull();
    expect(typeof res.body.data.workedMinutes).toBe("number");
    expect(res.body.data.workedMinutes).toBeGreaterThanOrEqual(0);
  });

  it("prevents clock-out when not clocked in", async () => {
    const res = await authedRequest(token)
      .post("/api/v1/clock/out")
      .send({ userId });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not clocked in/i);
  });

  it("returns correct clock status", async () => {
    const before = await authedRequest(token).get(
      `/api/v1/clock/status/${userId}`,
    );
    expect(before.body.data.isClockedIn).toBe(false);

    await authedRequest(token).post("/api/v1/clock/in").send({ userId });

    const after = await authedRequest(token).get(
      `/api/v1/clock/status/${userId}`,
    );
    expect(after.body.data.isClockedIn).toBe(true);
    expect(after.body.data.currentRecord.id).toBeDefined();
  });

  it("handles concurrent clock-ins safely", async () => {
    const [res1, res2] = await Promise.all([
      authedRequest(token).post("/api/v1/clock/in").send({ userId }),
      authedRequest(token).post("/api/v1/clock/in").send({ userId }),
    ]);

    const statuses = [res1.status, res2.status];

    expect(statuses).toContain(201);

    const rejectedStatus = statuses.find((s) => s !== 201);
    expect([400, 409]).toContain(rejectedStatus);

    const openRecords = await prisma.timeRecord.findMany({
      where: { userId, clockOut: null },
    });
    expect(openRecords).toHaveLength(1);
  });
});
