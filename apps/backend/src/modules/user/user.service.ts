import type { User } from '@prisma/client';
import { createUser, deleteUser, getUser, listUsers, updateUser } from './user.repository';
import type { UserCreateInput, UserUpdateInput } from './user.schema';

export const userService = {
  list: async (): Promise<User[]> => listUsers(),
  get: async (id: string): Promise<User | null> => getUser(id),
  create: async (data: UserCreateInput): Promise<User> => createUser(data),
  update: async (id: string, data: UserUpdateInput): Promise<User> => updateUser(id, data),
  delete: async (id: string): Promise<void> => deleteUser(id)
};

