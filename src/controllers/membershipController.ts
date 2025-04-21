import { Request, Response } from "express";
import MembershipService from "../services/membershipService";
import { StatusCodes } from "http-status-codes";

export const createMembership = async (req: Request, res: Response) => {
    const { userId, squadId } = req.body;
    if (!userId || !squadId) {
        res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "User ID and Squad ID are required" });
        return;
    }
    
    try {
        const membership = await MembershipService.createMembership(userId, squadId);
        res.status(StatusCodes.CREATED).json(membership);
    } catch (error) {
        console.error("Error creating membership:", error);
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
};

export const deleteMembership = async (req: Request, res: Response) => {
    const { userId, squadId } = req.body;
    if (!userId || !squadId) {
        res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "User ID and Squad ID are required" });
        return;
    }
    
    try {
        const membership = await MembershipService.deleteMembership(userId, squadId);
        res.status(StatusCodes.OK).json(membership);
    } catch (error) {
        console.error("Error deleting membership:", error);
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal server error" });
    }
};