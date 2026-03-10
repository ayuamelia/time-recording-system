import bcrypt from 'bcryptjs';
import prisma from '../config/database';

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'employee' = 'employee'
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { name, email, passwordHash, role } });
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return user;
}

export async function listUsers() {
  return prisma.user.findMany({ orderBy: { name: 'asc' } });
}

export async function updateUser(id: string, data: { name?: string; email?: string }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('User not found');
  return prisma.user.delete({ where: { id } });
}