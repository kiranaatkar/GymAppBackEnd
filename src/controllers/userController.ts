import { Request, Response } from "express";
import UserService from "../services/userService";
import { StatusCodes } from "http-status-codes";

export const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Name and password is required" });
    return;
  }

  try {
    const user = await UserService.createUser(username, password);
    res.status(StatusCodes.CREATED).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const signInUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Name and password is required" });
    return;
  }

  try {
    const user = await UserService.signInUser(username, password);
    res.json(user);
  } catch (error) {
    console.error("Error logging in:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getUserSquads = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const squads = await UserService.getUserSquads(userId);
    res.json(squads);
  } catch (error) {
    console.error("Error fetching user squads:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getUserVisits = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const visits = await UserService.getUserVisits(userId);
    res.json(visits);
  } catch (error) {
    console.error("Error fetching user visits:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const addUserVisit = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const visitDate = new Date(req.body.visit_date);
    if (!visitDate) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Visit date is required" });
      return;
    }
    const visit = await UserService.addUserVisit(userId, visitDate);
    res.status(StatusCodes.CREATED).json(visit);
  } catch (error) {
    console.error("Error adding user visit:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
}

export const deleteUserVisit = async (req: Request, res: Response) => {
  try {
    const visitId = parseInt(req.params.visitId);
    await UserService.deleteUserVisit(visitId);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error("Error deleting user visit:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};