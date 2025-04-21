import express from "express";
import {
  createSquad,
  getAllSquads,
  getSquadMembers,
  getSquadVisits
} from "../controllers/squadController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Squads
 *   description: Squad-related operations
 */

/**
 * @swagger
 * /api/squads/all:
 *   get:
 *     summary: Get all squads
 *     tags: [Squads]
 *     description: Fetches all registered squads
 *     responses:
 *       200:
 *         description: A list of squads
 */
router.get("/all", getAllSquads);

/**
 * @swagger
 * /api/squads/{squadId}/members:
 *   get:
 *     summary: Get all users which are part of a squad
 *     tags: [Squads]
 *     description: Fetches all users registered to the squad
 *     parameters:
 *       - name: squadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the squad
 *     responses:
 *       200:
 *         description: A list of users
 *       404:
 *         description: Squad not found
 *       500:
 *         description: Internal server error
 */
router.get("/:squadId/members", getSquadMembers);

/**
 * @swagger
 * /api/squads/{squadId}/visits:
 *   get:
 *     summary: Get gym visit timestamps for all users in a squad
 *     tags: [Squads]
 *     parameters:
 *       - in: path
 *         name: squadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the squad
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter start date (YYYY-MM-DD). Defaults to 2 weeks ago.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter end date (YYYY-MM-DD). Defaults to today.
 *     responses:
 *       200:
 *         description: List of visit timestamps
 *       404:
 *         description: Squad not found
 *       500:
 *         description: Internal server error
 */
router.get("/:squadId/visits", getSquadVisits);


/**
 * @swagger
 * /api/squads/create:
 *   post:
 *     summary: Create a new squad
 *     tags: [Squads]
 *     description: Registers a new squad with a description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               squadName:
 *                 type: string
 *               squadDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Squad created successfully
 *       400:
 *         description: Missing required fields
 */
router.post("/create", createSquad);

export default router;
