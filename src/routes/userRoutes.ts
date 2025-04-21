import express from "express";
import {
  createUser,
  getUserSquads,
  getAllUsers,
  signInUser,
  getUserVisits
} from "../controllers/userController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User-related operations
 */

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     description: Fetches all registered users
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get("/all", getAllUsers);

/**
 * @swagger
 * /api/users/{userId}/squads:
 *   get:
 *     summary: Get all squads a user is part of
 *     tags: [Users]
 *     description: Fetches all squads the user is registered to
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: A list of squads
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get("/:userId/squads", getUserSquads);

/**
 * @swagger
 * /api/users/{userId}/visits:
 *   get:
 *     summary: Get all visits of a user
 *     tags: [Users]
 *     description: Fetches all visits of the user
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: A list of visits
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/:userId/visits", getUserVisits);

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     description: Registers a new user with a username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Missing required fields
 */
router.post("/create", createUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     description: Authenticates a user and returns a token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
router.post("/signin", signInUser);

export default router;
