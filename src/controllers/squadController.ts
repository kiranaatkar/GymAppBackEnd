import { Request, Response } from "express";
import SquadService from "../services/squadService";
import { StatusCodes } from "http-status-codes";

export const createSquad = async (req: Request, res: Response) => {
  const { squadName, squadDescription } = req.body;
  if (!squadName || !squadDescription) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Name and description is required" });
    return;
  }

  try {
    const squad = await SquadService.createSquad(squadName, squadDescription);
    res.status(StatusCodes.CREATED).json(squad);
  } catch (error) {
    console.error("Error creating squad:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getAllSquads = async (req: Request, res: Response) => {
  try {
    const squads = await SquadService.getAllSquads();
    res.json(squads);
  } catch (error) {
    console.error("Error fetching squads:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export const getSquadMembers = async (req: Request, res: Response) => {
  try {
    const squadId = parseInt(req.params.squadId);
    const members = await SquadService.getSquadMembers(squadId);
    res.json(members);
  } catch (error) {
    console.error("Error fetching squad members:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};