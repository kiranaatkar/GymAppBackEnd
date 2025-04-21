import pool from "../config/db";

class MembershipService {
  static async createMembership(
    userId: number,
    squadId: number
  ): Promise<string | { membership: { userId: number; squadId: number } }> {
    try {
        // Check if the user already has a membership in the squad
        const { rowCount: existingMembershipCount } = await pool.query(
            "SELECT * FROM memberships WHERE user_id = $1 AND squad_id = $2",
            [userId, squadId]
        );
        if (existingMembershipCount && existingMembershipCount > 0) {
            throw new Error("User already has a membership in this squad");
        }
      const { rows } = await pool.query(
        "INSERT INTO memberships (user_id, squad_id) VALUES ($1, $2) RETURNING id",
        [userId, squadId]
      );

      if (rows.length === 0) {
        throw new Error("Membership creation failed");
      }

      const membership = { userId, squadId };
      return { membership };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return "An unknown error occurred";
    }
  }
  static async deleteMembership(
    userId: number,
    squadId: number
  ): Promise<string | { message: string }> {
    try {
      const { rowCount } = await pool.query(
        "DELETE FROM memberships WHERE user_id = $1 AND squad_id = $2",
        [userId, squadId]
      );

      if (rowCount === 0) {
        throw new Error("Membership deletion failed");
      }

      return { message: "Membership deleted successfully" };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return "An unknown error occurred";
    }
  }

}

export default MembershipService;
