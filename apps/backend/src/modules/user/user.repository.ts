import { prisma } from '../../db.js';
import type { User } from '@prisma/client';
import type { UserCreateInput, UserUpdateInput } from './user.schema.js';

export async function listUsers(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}

