import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import prisma from '../config/database';
import { DailyTotal, ReportResult } from '../types';
import { isWorkingDay } from './workConfigService';

dayjs.extend(utc);

export async function generateReport(
  userId: string,
  from: string, // YYYY-MM-DD
  to: string    // YYYY-MM-DD
): Promise<ReportResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Fetch all records in range
  const records = await prisma.timeRecord.findMany({
    where: {
      userId,
      date: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    orderBy: { clockIn: 'asc' },
  });

  // Build a map: YYYY-MM-DD → list of records
  const byDate = new Map<string, typeof records>();
  for (const r of records) {
    const key = dayjs.utc(r.date).format('YYYY-MM-DD');
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(r);
  }

  // Enumerate every date in the range
  const dailyTotals: DailyTotal[] = [];
  let cursor = dayjs.utc(from);
  const end = dayjs.utc(to);

  let aggregateTotalWorkedMinutes = 0;
  let aggregateTotalOvertimeMinutes = 0;
  let totalWorkingDays = 0;

  while (!cursor.isAfter(end)) {
    const dateStr = cursor.format('YYYY-MM-DD');
    const working = await isWorkingDay(dateStr);
    if (working) totalWorkingDays++;

    const dayRecords = byDate.get(dateStr) ?? [];
    const totalWorkedMinutes = dayRecords.reduce(
      (sum, r) => sum + (r.workedMinutes ?? 0),
      0
    );
    const totalOvertimeMinutes = dayRecords.reduce(
      (sum, r) => sum + (r.overtimeMinutes ?? 0),
      0
    );

    dailyTotals.push({
      date: dateStr,
      isWorkingDay: working,
      totalWorkedMinutes,
      totalOvertimeMinutes,
      sessions: dayRecords.length,
    });

    aggregateTotalWorkedMinutes += totalWorkedMinutes;
    aggregateTotalOvertimeMinutes += totalOvertimeMinutes;

    cursor = cursor.add(1, 'day');
  }

  return {
    userId,
    userName: user.name,
    from,
    to,
    dailyTotals,
    aggregateTotalWorkedMinutes,
    aggregateTotalOvertimeMinutes,
    totalWorkingDays,
  };
}
