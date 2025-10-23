import type { Request, Response } from 'express';
import { userService } from './user.service.js';
import { userCreateSchema, userUpdateSchema } from './user.schema.js';

export const userController = {
  list: async (_req: Request, res: Response) => {
    const users = await userService.list();
    res.json(users);
  },
  get: async (req: Request, res: Response) => {
    const user = await userService.get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  },
  create: async (req: Request, res: Response) => {
    const parse = userCreateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const created = await userService.create(parse.data);
    res.status(201).json(created);
  },
  update: async (req: Request, res: Response) => {
    const parse = userUpdateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const updated = await userService.update(req.params.id, parse.data);
    res.json(updated);
  },
  delete: async (req: Request, res: Response) => {
    await userService.delete(req.params.id);
    res.status(204).send();
  }
};

