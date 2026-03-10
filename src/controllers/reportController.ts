import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { generateReport } from '../services/reportService';
import { sendSuccess, sendError } from '../utils/response';

export async function getReport(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const { userId, from, to } = req.query as { userId: string; from: string; to: string };
  const report = await generateReport(userId, from, to);
  sendSuccess(res, report);
}
