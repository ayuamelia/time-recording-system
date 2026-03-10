import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  // Prisma write conflict (serializable transaction aborted) → 409
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2034'
  ) {
    res.status(409).json({ success: false, error: 'Request conflict, please try again' });
    return;
  }

  // 401 errors
  if (['invalid email or password'].some((m) => err.message.toLowerCase().includes(m))) {
    res.status(401).json({ success: false, error: err.message });
    return;
  }

  // 404 errors
  if (['not found'].some((m) => err.message.toLowerCase().includes(m))) {
    res.status(404).json({ success: false, error: err.message });
    return;
  }

  // 400 errors
  if (
    ['already clocked in', 'not clocked in', 'must be after', 'already in use', 'invalid date']
      .some((m) => err.message.toLowerCase().includes(m))
  ) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
}