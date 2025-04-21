import { User, Squad, Visit } from "../interfaces";
import pool from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class UserService {
  static async createUser(
    username: string,
    password: string
  ): Promise<string | { token: string }> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        "INSERT INTO users (username, hashed_password) VALUES ($1, $2) RETURNING id",
        [username, hashedPassword]
      );

      if (rows.length === 0) {
        throw new Error("User creation failed");
      }

      const userId: number = rows[0].id;
      const token = this.createToken(userId, username);
      return { token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return "An unknown error occurred";
    }
  }

  static async signInUser(
    username: string,
    password: string
  ): Promise<string | { token: string }> {
    try {
      const { rows } = await pool.query<{
        id: number;
        hashed_password: string;
      }>("SELECT id, hashed_password FROM users WHERE username = $1", [
        username,
      ]);
      if (rows.length === 0) {
        return "User not found";
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.hashed_password);
      if (!match) {
        return "Invalid password";
      }
      const token = this.createToken(user.id, username);
      return { token };
    } catch (error: unknown) {
        console.error("Error logging in:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
      
        return `Unknown error occured`;
    }
  }

  static createToken(userId: number, username: string): string {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: "7d" });
  }

  static async getAllUsers(): Promise<User[]> {
    const { rows: users } = await pool.query<User>("SELECT * FROM users");
    return users;
  }

  static async getUserSquads(userId: number): Promise<Squad[]> {
    const { rows: squads } = await pool.query<Squad>(
      "SELECT squad_id, squad_name, squad_description FROM memberships m join squads s on m.squad_id = s.id WHERE m.user_id = $1",
      [userId]
    );
    return squads;
  }

  static async getUserVisits(userId: number): Promise<Visit[]> {
    const { rows: visits } = await pool.query<Visit>(
      "SELECT id, visit_date FROM visits WHERE user_id = $1",
      [userId]
    );
    return visits;
  }

  static async addUserVisit(userId: number, visitDate: Date): Promise<void> {
    await pool.query(
      "INSERT INTO visits (user_id, visit_date) VALUES ($1, $2)",
      [userId, visitDate]
    );
  }

  static async deleteUserVisit(visitId: number): Promise<void> {
    await pool.query("DELETE FROM visits WHERE id = $1", [visitId]);
  }

}

export default UserService;
