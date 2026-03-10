import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { getWorkConfig, upsertWorkConfig } from '../services/workConfigService';
import { sendSuccess, sendError } from '../utils/response';

// ─── Work Config ─────────────────────────────────────────────────────────────

export async function getConfig(req: Request, res: Response) {
  const config = await getWorkConfig();
  sendSuccess(res, {
    ...config,
    workingDaysOfWeek: JSON.parse(config.workingDaysOfWeek),
  });
}

export async function updateConfig(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const config = await upsertWorkConfig(req.body);
  sendSuccess(res, {
    ...config,
    workingDaysOfWeek: JSON.parse(config.workingDaysOfWeek),
  });
}

// ─── Calendar Overrides ───────────────────────────────────────────────────────

export async function listOverrides(req: Request, res: Response) {
  const overrides = await prisma.workCalendarOverride.findMany({
    orderBy: { date: 'asc' },
  });
  sendSuccess(res, overrides);
}

export async function upsertOverride(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const { date, isWorkingDay, description } = req.body as {
    date: string;
    isWorkingDay: boolean;
    description?: string;
  };

  const override = await prisma.workCalendarOverride.upsert({
    where: { date: new Date(date) },
    create: { date: new Date(date), isWorkingDay, description },
    update: { isWorkingDay, description },
  });
  sendSuccess(res, override, 201);
}

export async function deleteOverride(req: Request, res: Response) {
  const { date } = req.params;
  const existing = await prisma.workCalendarOverride.findUnique({
    where: { date: new Date(date) },
  });
  if (!existing) return sendError(res, 'Override not found', 404);
  await prisma.workCalendarOverride.delete({ where: { date: new Date(date) } });
  sendSuccess(res, null, 200, 'Override deleted');
}
