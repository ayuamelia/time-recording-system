import prisma from '../config/database';
import { CreateTimeRecordPayload, UpdateTimeRecordPayload } from '../types';
import { minutesBetween, toLocalDate } from '../utils/time';
import { computeOvertime } from './workConfigService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function recalculate(clockIn: Date, clockOut?: Date | null) {
  if (!clockOut) return { workedMinutes: null, overtimeMinutes: null };
  const workedMinutes = minutesBetween(clockIn, clockOut);
  const overtimeMinutes = await computeOvertime(workedMinutes);
  return { workedMinutes, overtimeMinutes };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createTimeRecord(payload: CreateTimeRecordPayload) {
  const clockIn = new Date(payload.clockIn);
  const clockOut = payload.clockOut ? new Date(payload.clockOut) : undefined;

  if (clockOut && clockOut <= clockIn)
    throw new Error('clockOut must be after clockIn');

  const { workedMinutes, overtimeMinutes } = await recalculate(clockIn, clockOut);

  return prisma.timeRecord.create({
    data: {
      userId: payload.userId,
      clockIn,
      clockOut: clockOut ?? null,
      date: new Date(toLocalDate(clockIn)),
      workedMinutes,
      overtimeMinutes,
      notes: payload.notes ?? null,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function getTimeRecord(id: string) {
  const record = await prisma.timeRecord.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!record) throw new Error('Time record not found');
  return record;
}

export async function listTimeRecords(filters: {
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const { userId, from, to, page = 1, limit = 20 } = filters;

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const [records, total] = await prisma.$transaction([
    prisma.timeRecord.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { clockIn: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.timeRecord.count({ where }),
  ]);

  return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateTimeRecord(id: string, payload: UpdateTimeRecordPayload) {
  const existing = await prisma.timeRecord.findUnique({ where: { id } });
  if (!existing) throw new Error('Time record not found');

  const clockIn = payload.clockIn ? new Date(payload.clockIn) : existing.clockIn;
  const clockOut = payload.clockOut
    ? new Date(payload.clockOut)
    : payload.clockOut === null
    ? null
    : existing.clockOut;

  if (clockOut && clockOut <= clockIn)
    throw new Error('clockOut must be after clockIn');

  const { workedMinutes, overtimeMinutes } = await recalculate(clockIn, clockOut);

  return prisma.timeRecord.update({
    where: { id },
    data: {
      clockIn,
      clockOut,
      date: new Date(toLocalDate(clockIn)),
      workedMinutes,
      overtimeMinutes,
      notes: payload.notes !== undefined ? payload.notes : existing.notes,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function deleteTimeRecord(id: string) {
  const existing = await prisma.timeRecord.findUnique({ where: { id } });
  if (!existing) throw new Error('Time record not found');
  return prisma.timeRecord.delete({ where: { id } });
}
