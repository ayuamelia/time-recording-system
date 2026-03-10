import prisma from '../config/database';
import { WorkConfigPayload } from '../types';
import { dayOfWeek } from '../utils/time';

/**
 * Fetches the single active WorkConfig row.
 * Creates a default one (Mon–Fri, 8 h/day) if none exists.
 */
export async function getWorkConfig() {
  const configs = await prisma.workConfig.findMany({
    orderBy: { effectiveFrom: 'desc' },
    take: 1,
  });

  if (configs.length > 0) return configs[0];

  // Bootstrap default config
  return prisma.workConfig.create({
    data: {
      normalHoursPerDay: 8,
      workingDaysOfWeek: JSON.stringify([1, 2, 3, 4, 5]),
      effectiveFrom: new Date(),
    },
  });
}

/**
 * Updates (replaces) the work configuration.
 */
export async function upsertWorkConfig(payload: WorkConfigPayload) {
  const existing = await getWorkConfig();

  return prisma.workConfig.update({
    where: { id: existing.id },
    data: {
      normalHoursPerDay: payload.normalHoursPerDay,
      workingDaysOfWeek: JSON.stringify(payload.workingDaysOfWeek),
      effectiveFrom: new Date(),
    },
  });
}

/**
 * Determines whether a given YYYY-MM-DD string is a working day.
 * Calendar overrides take precedence over the weekday rule.
 */
export async function isWorkingDay(dateStr: string): Promise<boolean> {
  // 1. Check calendar override
  const override = await prisma.workCalendarOverride.findUnique({
    where: { date: new Date(dateStr) },
  });
  if (override !== null) return override.isWorkingDay;

  // 2. Fall back to weekday rule
  const config = await getWorkConfig();
  const allowedDays: number[] = JSON.parse(config.workingDaysOfWeek);
  return allowedDays.includes(dayOfWeek(dateStr));
}

/**
 * Compute overtime minutes given total worked minutes for a day.
 */
export async function computeOvertime(workedMinutes: number): Promise<number> {
  const config = await getWorkConfig();
  const normalMinutes = config.normalHoursPerDay * 60;
  return Math.max(0, workedMinutes - normalMinutes);
}
