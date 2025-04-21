import { User, Squad } from "../interfaces";
import pool from "../config/db";

class SquadService {
  static async createSquad(
    squadName: string,
    squadDescription: string
  ): Promise<string | { squad: { squadName: string; squadDescription: string } }> {
    try {
      const { rows } = await pool.query(
        "INSERT INTO squads (squad_name, squad_description) VALUES ($1, $2) RETURNING id",
        [squadName, squadDescription]
      );

      if (rows.length === 0) {
        throw new Error("Squad creation failed");
      }

      const squad = { squadName, squadDescription };
      return { squad };

    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return "An unknown error occurred";
    }
  }

  static async getAllSquads(): Promise<Squad[]> {
    const { rows: squads } = await pool.query<Squad>("SELECT * FROM squads");
    return squads;
  }

  static async getSquadMembers(squadId: number): Promise<User[]> {
    const { rows: members } = await pool.query<User>(
      `SELECT u.* 
       FROM memberships m 
       JOIN users u ON m.user_id = u.id 
       WHERE m.squad_id = $1`,
      [squadId]
    );
    return members;
  }

}

export default SquadService;
