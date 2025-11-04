import { Router } from 'express';
import { userController } from './user.controller';
import { requireAuth, requireRole, requireSelfOrRole } from '../../middlewares/auth';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: "string" }
 *         name: { type: "string" }
 *         email: { type: "string", format: "email" }
 *         role:
 *           type: "string"
 *           enum: ["admin", "user"]
 *         createdAt: { type: "string", format: "date-time" }
 *         updatedAt: { type: "string", format: "date-time" }
 *     UserCreate:
 *       type: object
 *       required: [name, email]
 *       properties:
 *         name: { type: "string" }
 *         email: { type: "string", format: "email" }
 *         role:
 *           type: "string"
 *           enum: ["admin", "user"]
 *           default: "user"
 *     UserUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/UserCreate'
 */

// RBAC: admin pode listar/criar/deletar; owner ou admin podem ler/atualizar um user específico
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', requireAuth, requireRole(['admin']), userController.list);
/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/', requireAuth, requireRole(['admin']), userController.create);
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Not found
 */
router.get('/:id', requireAuth, requireSelfOrRole(['admin']), userController.get);
/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put('/:id', requireAuth, requireSelfOrRole(['admin']), userController.update);
/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     summary: Patch user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch('/:id', requireAuth, requireSelfOrRole(['admin']), userController.update);
/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete('/:id', requireAuth, requireRole(['admin']), userController.delete);

export default router;
