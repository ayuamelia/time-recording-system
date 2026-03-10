import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

/**
 * Returns the number of minutes between two dates.
 */
export function minutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

/**
 * Returns the local YYYY-MM-DD string for a given date (or now).
 * Uses the APP_TIMEZONE env var, falling back to UTC.
 */
export function toLocalDate(date: Date = new Date()): string {
  const tz = process.env.APP_TIMEZONE ?? 'UTC';
  return dayjs(date).tz(tz).format('YYYY-MM-DD');
}

/**
 * Parses a YYYY-MM-DD string into a Date object (midnight UTC).
 */
export function parseDate(dateStr: string): Date {
  const d = dayjs.utc(dateStr, 'YYYY-MM-DD', true);
  if (!d.isValid()) throw new Error(`Invalid date format: "${dateStr}" (expected YYYY-MM-DD)`);
  return d.toDate();
}

/**
 * Returns the day-of-week number (0=Sun … 6=Sat) for a YYYY-MM-DD string.
 */
export function dayOfWeek(dateStr: string): number {
  return dayjs.utc(dateStr).day();
}

/**
 * Formats minutes as "Xh Ym" (e.g. "9h 30m").
 */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
