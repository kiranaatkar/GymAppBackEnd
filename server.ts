import { Application } from "https://deno.land/x/abc/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

import { User, Squad } from "./interfaces.ts";


// denon run --allow-net --allow-read --allow-write server.js

const db = new DB("gymAppTest.db");
const app = new Application();
const PORT = 8080;
const allowedHeaders = [
"Authorization",
"Content-Type",
"Accept",
"Origin",
"User-Agent",
];
const allowedMethods = ["GET", "POST", "DELETE"];

const corsConfig = abcCors({
    origin: "http://localhost:3000",
    Headers: allowedHeaders,
    Methods: allowedMethods,
    credentials: true,
});

app.use(corsConfig);

app
.post("/users", createAccount)
.post("/squads/:squadId/addUser", addUserToSquad)
.post("/squads/:squadId/removeUser", removeUserFromSquad)
.get("/squads/:squadId/users", retrieveSquadUsers)
.get("/users/:userId/squads", retrieveUserSquads)

.start({ port: PORT });

async function createAccount(server) {
    const { email, password, confirmation } = await server.body;
    const validationObject = await validateCreateAccountRequest(
        email,
        password,
        confirmation
    );
    if (validationObject.result) {
        const passwordEncrypted = await createHash(password);
        const query = `INSERT INTO users(email, encrypted_password, created_at, updated_at) 
                        VALUES (?, ?, datetime('now'), datetime('now'));`;

        await db.query(query, [email, passwordEncrypted]);
        await login(server);
    } else {
        server.json({ message: validationObject.msg }, 400);
    }
}

async function retrieveSquadUsers(server) {
    const { squadId } = await server.params;
    const squad: Squad = await findById("squads", squadId)

    if (!squad) {
        server.json({ msg: `Squad ${squadId} doesn't exist` }, 404);
        return; // Return early if the squad doesn't exist
    }

    const query: string = `
        SELECT * FROM users u
        JOIN memberships m ON u.id = m.user_id
        WHERE m.squad_id = ?`;
    
    try {
        const users: User[] = [...await db.query(query, [squadId])]
        server.json({ users }, 200);
    } catch (error) {
        console.error("Error retrieving squad users:", error);
        server.json({ msg: "An unexpected error occurred" }, 500);
    }
}


async function retrieveUserSquads(server) {
    const { userId } = await server.params
    const user: User = await findById("users", userId)

    if (!user) {
        server.json({ msg: `User ${userId} doesn't exist` }, 404);
    }

    const query: string = `
        SELECT * FROM squads s
        JOIN memberships m ON s.id = m.squad_id
        WHERE m.user_id = ?`;

    try {
        const squads: Squad[] = [...await db.query(query, [userId])]
        server.json({ squads }, 200)
    } catch (error) {
        console.error("Error retrieving user squads:", error);
        server.json({ msg: "An unexpected error occurred" }, 500);
    }
}


async function addUserToSquad(server) {
    const { userId } = await server.body;
    const { squadId } = await server.params;
    const query = `INSERT INTO memberships(squad_id, user_id, created_at, updated_at) 
                   VALUES (?, ?, datetime('now'), datetime('now'));`;
    await db.query(query, [squadId, userId]);
    server.json({ msg: "User added to squad" }, 200);
}

async function removeUserFromSquad(server) {
    const { user_id } = await server.body;
    const { squad_id } = await server.params;
    const query = `DELETE FROM memberships WHERE squad_id = ? AND user_id = ?`;
    await db.query(query, [squad_id, user_id]);
    server.json({ msg: "User removed from the squad" }, 200);
}



// HELPER METHODS

async function findById(table, id) {
    // cant parameterise table names in SQL, but this variable is not user generated
    const query = `SELECT * from ${table} where id = ?`;
    const [entity] = await db.query(query, [id]).asObjects();
    
    return entity;
}



async function validateCreateAccountRequest(email, password, confirmation) {
    // Check if the email already exists in the database
    const [userExists] = await db.query(
        `SELECT COUNT(*) AS count FROM users WHERE email = ?`,
        [email]
    );

    if (userExists[0].count > 0) {
        return { result: false, msg: `An account already exists with the e-mail ${email}.` };
    }

    if (password !== confirmation) {
        return { result: false, msg: "Passwords do not match." };
    }

    if (password.length < 4) {
        return { result: false, msg: "Password must be at least 4 characters." };
    }

    return { result: true, msg: "Success" };
}

async function createHash(password) {
    const salt = await bcrypt.genSalt(8);
    const passwordEncrypted = await bcrypt.hash(password, salt);
    return passwordEncrypted;
}

async function login(server) {
    const { email, password } = await server.body;
    const validation = await validateUser(email, password);
    server.json({ msg: validation.msg }, validation.result ? 200 : 400);
}

async function validateUser(email, password) {
    try {
        const query = `SELECT * FROM users WHERE email = ?`;

        const [user] = await db.query(query, [email]).asObjects();

        if (!user) {
            return { result: false, msg: `User ${email} does not exist` };
        }

        const passwordMatch = await bcrypt.compare(password, user.encrypted_password);

        if (!passwordMatch) {
            return { result: false, msg: `Incorrect password` };
        }

        return { result: true, user, msg: "Success" };
    } catch (error) {
        console.error("Error validating user:", error);
        return { result: false, msg: "An unexpected error occurred." };
    }
}



console.log(`Server running on http://localhost:${PORT}`);