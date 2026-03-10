import prisma from '../config/database';
import { minutesBetween, toLocalDate } from '../utils/time';
import { computeOvertime } from './workConfigService';

// ─── Clock In ────────────────────────────────────────────────────────────────

export async function clockIn(userId: string, notes?: string) {
  return prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      // Guard: already clocked in?
      const open = await tx.timeRecord.findFirst({
        where: { userId, clockOut: null },
        orderBy: { clockIn: 'desc' },
      });
      if (open) {
        throw new Error(
          `User is already clocked in (record ${open.id}, since ${open.clockIn.toISOString()})`
        );
      }

      const now = new Date();
      return tx.timeRecord.create({
        data: {
          userId,
          clockIn: now,
          date: new Date(toLocalDate(now)),
          notes: notes ?? null,
        },
      });
    },
    {
      isolationLevel: 'Serializable', // ← prevents concurrent clock-ins at DB level
    }
  );
}

// ─── Clock Out ───────────────────────────────────────────────────────────────

export async function clockOut(userId: string, notes?: string) {
  return prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const open = await tx.timeRecord.findFirst({
        where: { userId, clockOut: null },
        orderBy: { clockIn: 'desc' },
      });
      if (!open) throw new Error('User is not clocked in');

      const now = new Date();
      const workedMinutes = minutesBetween(open.clockIn, now);
      const overtimeMinutes = await computeOvertime(workedMinutes);

      return tx.timeRecord.update({
        where: { id: open.id },
        data: {
          clockOut: now,
          workedMinutes,
          overtimeMinutes,
          notes: notes ?? open.notes,
        },
      });
    },
    {
      isolationLevel: 'Serializable',
    }
  );
}

// ─── Status ──────────────────────────────────────────────────────────────────

export async function getClockStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const open = await prisma.timeRecord.findFirst({
    where: { userId, clockOut: null },
    orderBy: { clockIn: 'desc' },
  });

  return {
    userId,
    isClockedIn: !!open,
    currentRecord: open
      ? { id: open.id, clockIn: open.clockIn, notes: open.notes }
      : undefined,
  };
}