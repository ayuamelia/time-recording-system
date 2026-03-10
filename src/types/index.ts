// ─── Shared TypeScript types ────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'employee';
}

// ─── Clock ───────────────────────────────────────────────────────────────────

export interface ClockInPayload {
  userId: string;
  notes?: string;
}

export interface ClockOutPayload {
  userId: string;
  notes?: string;
}

export interface ClockStatus {
  userId: string;
  isClockedIn: boolean;
  currentRecord?: {
    id: string;
    clockIn: Date;
    notes?: string | null;
  };
}

// ─── Time Records ─────────────────────────────────────────────────────────────

export interface CreateTimeRecordPayload {
  userId: string;
  clockIn: string;   // ISO datetime string
  clockOut?: string; // ISO datetime string
  notes?: string;
}

export interface UpdateTimeRecordPayload {
  clockIn?: string;
  clockOut?: string;
  notes?: string;
}

// ─── Work Config ─────────────────────────────────────────────────────────────

export interface WorkConfigPayload {
  normalHoursPerDay: number;      // 1–24
  workingDaysOfWeek: number[];    // [0..6], 0=Sun
}

// ─── Calendar Override ────────────────────────────────────────────────────────

export interface CalendarOverridePayload {
  date: string;          // YYYY-MM-DD
  isWorkingDay: boolean;
  description?: string;
}

// ─── Reporting ───────────────────────────────────────────────────────────────

export interface DailyTotal {
  date: string;           // YYYY-MM-DD
  isWorkingDay: boolean;
  totalWorkedMinutes: number;
  totalOvertimeMinutes: number;
  sessions: number;       // number of time records that day
}

export interface ReportResult {
  userId: string;
  userName: string;
  from: string;
  to: string;
  dailyTotals: DailyTotal[];
  aggregateTotalWorkedMinutes: number;
  aggregateTotalOvertimeMinutes: number;
  totalWorkingDays: number;
}
