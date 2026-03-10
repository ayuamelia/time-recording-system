-- Migration: 001_initial_schema
-- Created manually as reference; run `prisma migrate dev` to apply via Prisma.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time records (one row per clock-in/out session)
CREATE TABLE time_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clock_in         TIMESTAMPTZ NOT NULL,
  clock_out        TIMESTAMPTZ,
  date             DATE NOT NULL,           -- local date of the session
  worked_minutes   INTEGER,                 -- computed on clock-out
  overtime_minutes INTEGER,                 -- computed on clock-out
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_time_records_user_id ON time_records(user_id);
CREATE INDEX idx_time_records_date    ON time_records(date);

-- Calendar overrides (holidays / forced working days)
CREATE TABLE work_calendar_overrides (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE UNIQUE NOT NULL,
  is_working_day BOOLEAN NOT NULL DEFAULT FALSE,
  description    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Work configuration
CREATE TABLE work_config (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normal_hours_per_day  INTEGER NOT NULL DEFAULT 8,
  working_days_of_week  TEXT NOT NULL DEFAULT '[1,2,3,4,5]',  -- JSON array
  effective_from        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default config
INSERT INTO work_config (normal_hours_per_day, working_days_of_week)
VALUES (8, '[1,2,3,4,5]');
