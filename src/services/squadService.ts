import { User, Squad, Visit } from "../interfaces";
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

  static async getSquadVisits(squadId: number, startDate: Date, endDate: Date): Promise<Visit[] | string> {
    try {
      const query = `
        SELECT v.visit_date, u.username, u.id AS user_id
        FROM visits v
        JOIN users u ON v.user_id = u.id
        JOIN memberships m ON u.id = m.user_id
        WHERE m.squad_id = $1 AND v.visit_date BETWEEN $2 AND $3
        ORDER BY v.visit_date DESC
      `;
  
      const { rows } = await pool.query(query, [squadId, startDate, endDate]);
  
      return rows;
    } catch (err) {
      console.error("Error fetching squad visits:", err);
      return "Failed to fetch squad visits";
    }
  }

}

export default SquadService;
