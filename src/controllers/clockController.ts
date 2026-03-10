import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { clockIn, clockOut, getClockStatus } from '../services/clockService';
import { sendSuccess, sendError } from '../utils/response';

export async function handleClockIn(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const { userId, notes } = req.body as { userId: string; notes?: string };
  const record = await clockIn(userId, notes);
  sendSuccess(res, record, 201, 'Clocked in successfully');
}

export async function handleClockOut(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const { userId, notes } = req.body as { userId: string; notes?: string };
  const record = await clockOut(userId, notes);
  sendSuccess(res, record, 200, 'Clocked out successfully');
}

export async function handleClockStatus(req: Request, res: Response) {
  const { userId } = req.params;
  const status = await getClockStatus(userId);
  sendSuccess(res, status);
}
