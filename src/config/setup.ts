import pool from "./db";

const setupDB = async () => {
  try {
    // Create "films" table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Database is set up and ready.");
  } catch (err) {
    console.error("❌ Error setting up database:", err);
  }
};

export default setupDB;
