import express from 'express';
import { createMembership, deleteMembership } from '../controllers/membershipController';

const router = express.Router();

/**
 * @swagger
 * /api/memberships:
 *   post:
 *     summary: Add a user to a squad
 *     tags: [Memberships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - squadId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               squadId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Membership added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 membership:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.post('/', createMembership);

/**
 * @swagger
 * /api/memberships:
 *   delete:
 *     summary: Remove a user from a squad
 *     tags: [Memberships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - squadId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               squadId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Membership removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.delete('/', deleteMembership);

export default router;
