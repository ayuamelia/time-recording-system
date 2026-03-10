import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as svc from '../services/timeRecordService';
import { sendSuccess, sendError } from '../utils/response';

export async function createRecord(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const record = await svc.createTimeRecord(req.body);
  sendSuccess(res, record, 201);
}

export async function getRecord(req: Request, res: Response) {
  const record = await svc.getTimeRecord(req.params.id);
  sendSuccess(res, record);
}

export async function listRecords(req: Request, res: Response) {
  const { userId, from, to, page, limit } = req.query as Record<string, string>;
  const result = await svc.listTimeRecords({
    userId,
    from,
    to,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  sendSuccess(res, result);
}

export async function updateRecord(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const record = await svc.updateTimeRecord(req.params.id, req.body);
  sendSuccess(res, record);
}

export async function deleteRecord(req: Request, res: Response) {
  await svc.deleteTimeRecord(req.params.id);
  sendSuccess(res, null, 200, 'Time record deleted');
}
