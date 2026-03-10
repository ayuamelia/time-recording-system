import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { login } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';

export async function handleLogin(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const { email, password } = req.body as { email: string; password: string };
  const token = await login(email, password);
  sendSuccess(res, { token }, 200, 'Login successful');
}