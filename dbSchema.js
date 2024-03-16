import { DB } from "https://deno.land/x/sqlite/mod.ts";

try {
  await Deno.remove("gymApp.db");
} catch {
  // nothing to remove
}

const db = new DB("./gymApp.db");

await db.query(
  `CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  );`
);

await db.query(
  `CREATE TABLE squads (
    id INTEGER PRIMARY KEY,
    squad_name VARCHAR(50) UNIQUE NOT NULL,
    squad_description TEXT UNIQUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL -- Removed trailing comma
  );`
);

await db.query(
  `CREATE TABLE memberships (
    id INTEGER PRIMARY KEY,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    user_id INTEGER NOT NULL,
    squad_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
    FOREIGN KEY(squad_id) REFERENCES squads(id)
  );`
);


// Seed db with test data
//deno run --allow-read --allow-write dbSchema.js
//sqlite3 gymApp.db < dbSeed.sql