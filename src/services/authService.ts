import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken'; 
import prisma from '../config/database';
import { JwtPayload } from '../types';

export async function login(email: string, password: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email } });

  const dummyHash = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';
  const hashToCompare = user ? user.passwordHash : dummyHash;
  const isValid = await bcrypt.compare(password, hashToCompare);

  if (!user || !isValid) {
    throw new Error('Invalid email or password');
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as 'admin' | 'employee',
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  const signOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, signOptions);
}