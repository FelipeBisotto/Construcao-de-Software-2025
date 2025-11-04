import { prisma } from '../../db';
import type { User } from '@prisma/client';
import type { UserCreateInput, UserUpdateInput } from './user.schema';

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
  // Ensure only defined fields are passed to Prisma
  const updateData: Partial<UserUpdateInput> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  
  return prisma.user.update({ 
    where: { id }, 
    data: updateData 
  });
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}

