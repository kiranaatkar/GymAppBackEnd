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

export const getSquadVisits = async (req: Request, res: Response) => {
  try {
    const squadId = parseInt(req.params.squadId);
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 2 weeks ago
    const end = endDate ? new Date(endDate as string) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid date format" });
      return;
    }
    if (start > end) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Start date cannot be after end date" });
      return;
    }

    const visits = await SquadService.getSquadVisits(squadId, start, end);
    res.json(visits);
  } catch (error) {
    console.error("Error fetching squad visits:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
}