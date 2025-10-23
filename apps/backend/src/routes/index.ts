import { Router } from 'express';
import userRoutes from '../modules/user/user.routes.js';

export const router = Router();

router.use('/users', userRoutes);

