import { randomUUID } from 'crypto';
import { prisma } from '../src/db';
import { userService } from '../src/modules/user/user.service';

type BuildOverrides = Partial<{ name: string; email: string; role: 'admin' | 'user' }>;

function buildUserInput(overrides: BuildOverrides = {}) {
  const base = {
    name: overrides.name ?? `Test User ${randomUUID().slice(0, 8)}`,
    email: overrides.email ?? `user-${randomUUID()}@example.com`,
    role: overrides.role ?? 'user'
  };
  return base;
}

describe('userService CRUD', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a user and applies defaults', async () => {
    const created = await userService.create(buildUserInput());

    expect(created.id).toBeDefined();
    expect(created.role).toBe('user');

    const fromDb = await prisma.user.findUnique({ where: { id: created.id } });
    expect(fromDb?.email).toBe(created.email);
  });

  it('lists users ordered by most recent first', async () => {
    const older = await userService.create(buildUserInput({ name: 'Older' }));
    await new Promise((resolve) => setTimeout(resolve, 5));
    const newer = await userService.create(buildUserInput({ name: 'Newer' }));

    const users = await userService.list();
    expect(users.map((u) => u.id)).toEqual([newer.id, older.id]);
  });

  it('gets a user by id and returns null when missing', async () => {
    const created = await userService.create(buildUserInput());

    const found = await userService.get(created.id);
    expect(found?.email).toBe(created.email);

    const missing = await userService.get(randomUUID());
    expect(missing).toBeNull();
  });

  it('updates a user fields', async () => {
    const created = await userService.create(buildUserInput());

    const updated = await userService.update(created.id, { name: 'Updated', role: 'admin' });
    expect(updated.name).toBe('Updated');
    expect(updated.role).toBe('admin');
  });

  it('deletes a user', async () => {
    const created = await userService.create(buildUserInput());

    await userService.delete(created.id);

    const exists = await prisma.user.findUnique({ where: { id: created.id } });
    expect(exists).toBeNull();
  });
});
