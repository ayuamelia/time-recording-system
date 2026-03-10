import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as svc from '../services/userService';
import { sendSuccess, sendError } from '../utils/response';

export async function createUser(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);

  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'employee';
  };
  const user = await svc.createUser(name, email, password, role);
  sendSuccess(res, user, 201);
}

export async function getUser(req: Request, res: Response) {
  const user = await svc.getUser(req.params.id);
  sendSuccess(res, user);
}

export async function listUsers(req: Request, res: Response) {
  const users = await svc.listUsers();
  sendSuccess(res, users);
}

export async function updateUser(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, errors.array()[0].msg as string);
  const user = await svc.updateUser(req.params.id, req.body);
  sendSuccess(res, user);
}

export async function deleteUser(req: Request, res: Response) {
  await svc.deleteUser(req.params.id);
  sendSuccess(res, null, 200, 'User deleted');
}
