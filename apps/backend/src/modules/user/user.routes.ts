import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth, requireRole } from '../../middlewares/auth';

const router = Router();

// RBAC (habilita em T3): para desenvolvimento sem IdP, o middleware aceita token vazio
router.get('/', requireAuth, requireRole(['admin']), userController.list);
router.post('/', requireAuth, requireRole(['admin']), userController.create);
router.get('/:id', requireAuth, userController.get);
router.put('/:id', requireAuth, userController.update);
router.patch('/:id', requireAuth, userController.update);
router.delete('/:id', requireAuth, requireRole(['admin']), userController.delete);

export default router;

