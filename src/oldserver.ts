import { Application } from "https://deno.land/x/abc/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

import { User, Squad } from "./interfaces.ts";


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
// USERS
.post("/users", createUser)
.get("/users/:userId/squads", getUserSquads)
.get("/users/:userId", getUser)
.put("/users/:userId", updateUser)

// SQUADS
.post("/squads", createSquad)
.get("/squads", getAllSquads)
//.get("/squads/{squadId}", getSquad) //TODO
//.put("/squads/{squadId}", updateSquad) //TODO
//.delete("/squads/{squadId}", deleteSquad) //TODO
.post("/squads/:squadId/addUser", addUserToSquad)
.post("/squads/:squadId/removeUser", removeUserFromSquad)
.get("/squads/:squadId/users", getSquadUsers)

// WORKOUTS
// .post("/workouts", addWorkout) //TODO
// .post("/workouts/:workoutId/like", likeWorkout) //TODO
// .post("/workouts/:workoutId/comment", commentOnWorkout) //TODO
// .get("/workouts", getWorkouts) //TODO - query params?
// .get("/workouts/:workoutId", getWorkout) //TODO
// .get("/workouts/user/:userId", getUserWorkouts) //TODO
// .put("/workouts/:workoutId", updateWorkout) //TODO
// .delete("/workouts/:workoutId", deleteWorkout) //TODO

// MESSAGES
// STRETCH GOAL MAYBE


.start({ port: PORT });

async function createUser(server) {
    try {
        const { email, username, password, confirmation } = await server.body;
        const validationObject = await validatecreateUserRequest(
            username,
            email,
            password,
            confirmation
        );
        if (!validationObject.result) {
            server.json({ message: validationObject.message }, 400);
            return;   
        }
        const passwordEncrypted = await createHash(password);
        const query = `INSERT INTO users(username, email, encrypted_password, created_at, updated_at) 
                       VALUES (?, ?, ?, datetime('now'), datetime('now'));`;
        await db.query(query, [username, email, passwordEncrypted]);

        const [user] = await db.query(`SELECT * from users where username = ?`, [username]).asObjects();
        server.json({ message: `User created successfully`, user }, 200);
    } catch (error) {
        console.error("Error creating user:", error);
        server.json({ message: "An unexpected error occurred" }, 500);
        return;
    }
}

async function getUserSquads(server) {
    try {
        const { userId } = await server.params
        const user: User = await findById("users", userId)
    
        if (!user) {
            server.json({ message: `User ${userId} doesn't exist` }, 404);
        }
    
        const query: string = `
            SELECT * FROM squads s
            JOIN memberships m ON s.id = m.squad_id
            WHERE m.user_id = ?`;
        const squads: Squad[] = [...await db.query(query, [userId])]
        server.json({ squads }, 200)
        return;
    } catch (error) {
        console.error("Error retrieving user squads:", error);
        server.json({ message: "An unexpected error occurred" }, 500);
        return;
    }
}

async function getUser(server) {
    try {
        const { userId } = await server.params
        const user: User = await findById("users", userId)
        server.json({user}, 200)
        return;
    } catch (error) {
        console.error("Error fetching user", error)
        server.json({message: "An unexpected error occured"}, 500)
        return;
    }
}

async function updateUser(server) {
    try {
        const { userId } = await server.params;
        const { email, username, password } = await server.body;

        // Check if the user exists
        const existingUser = await findById("users", userId);
        if (!existingUser) {
            server.json({ message: `User ${userId} not found` }, 404);
            return;
        }

        // Validate user input
        const validationObject = await validateUpdateUserRequest(email, password);
        if (!validationObject.result) {
            server.json({ message: validationObject.message }, 400);
            return;
        }

        // Update user data
        // COALESCE() returns the first non-null expression in the list, 
        // used to handle cases where fielsd may or may not be provided for update.
        const updateUserQuery = `
            UPDATE users 
            SET 
                email = COALESCE(?, email),
                username = COALESCE(?, username),
                encrypted_password = COALESCE(?, encrypted_password),
                updated_at = datetime('now')
            WHERE id = ?;
        `;

        // Hash password if provided
        const encryptedPassword = password ? await createHash(password) : existingUser.encrypted_password;

        await db.query(updateUserQuery, [email, username, encryptedPassword, userId]);
        server.json({ message: `User ${userId} updated successfully` }, 200);
        return;
    } catch (error) {
        console.error("Error updating user:", error);
        server.json({ message: "An unexpected error occurred" }, 500);
        return;
    }
}

async function createSquad(server) {
    try {
        const { squadName, squadDescription } = await server.body;
        const validationObject = await validatecreateSquadRequest(squadName);

        if (!validationObject.result) {
            server.json({ message: validationObject.message }, 400);
            return;
        }
        const query = `INSERT INTO squads(squad_name, squad_description, created_at, updated_at) 
                        VALUES (?, ?, datetime('now'), datetime('now'));`;

        await db.query(query, [squadName, squadDescription]);
        server.json({ message: `Squad ${squadName} updated successfully` }, 200);
        return;
    }
    catch(error) {
        console.error("Error creating squad", error)
        server.json({message: "An unexpected error occured"}, 500)
        return;
    }
}

async function getAllSquads(server) {
    try {
        const query: string = `SELECT * FROM squads`;
        const squads: Squad[] = [...await db.query(query)]
        server.json({squads}, 200)
        return;
    } catch (error) {
        console.error("Error fetching squads", error)
        server.json({message: "An unexpected error occured"}, 500)
        return;
    }
}

async function getSquadUsers(server) {
    try {
        const { squadId } = await server.params;
        const squad: Squad = await findById("squads", squadId)

        if (!squad) {
            server.json({ message: `Squad ${squadId} doesn't exist` }, 404);
            return;
        }

        const query: string = `
            SELECT * FROM users u
            JOIN memberships m ON u.id = m.user_id
            WHERE m.squad_id = ?`;
        const users: User[] = [...await db.query(query, [squadId])]
        server.json({ users }, 200);
        return;
    } catch (error) {
        console.error("Error retrieving squad users:", error);
        server.json({ message: "An unexpected error occurred" }, 500);
    }
}

async function addUserToSquad(server) {
    try {
        const { userId } = await server.body;
        const { squadId } = await server.params;
        const query = `INSERT INTO memberships(squad_id, user_id, created_at, updated_at) 
                    VALUES (?, ?, datetime('now'), datetime('now'));`;
        await db.query(query, [squadId, userId]);
        server.json({ message: "User added to squad" }, 200);
        return;
    }
    catch (error) {
        console.error("Error adding user to squad:", error);
        server.json({ message: "An unexpected error occurred" }, 500);
        return;
    }
}

async function removeUserFromSquad(server) {
    try {
        const { user_id } = await server.body;
        const { squad_id } = await server.params;
        const query = `DELETE FROM memberships WHERE squad_id = ? AND user_id = ?`;
        await db.query(query, [squad_id, user_id]);
        server.json({ message: "User removed from the squad" }, 200);
        return;
    } catch (error) {
        console.error("Error removing user to squad:", error);
        server.json({ message: "An unexpected error occurred" }, 500);
        return;
    }
}

// HELPER METHODS

async function findById(table, id) {
    // cant parameterise table names in SQL, but this variable is not user generated
    const query = `SELECT * from ${table} where id = ?`;
    const [entity] = await db.query(query, [id]).asObjects();
    
    return entity;
}

async function validatecreateUserRequest(username, email, password, confirmation) {
    // Check if the email already exists in the database
    const [userExists] = await db.query(
        `SELECT username, email FROM users WHERE email = ? OR username = ?`,
        [email, username]
    ).asObjects();
    
    if (userExists) {
        if (userExists.email === email) {
            return { result: false, message: `An account already exists with the email ${email}.` };
        } else if (userExists.username === username) {
            return { result: false, message: `An account already exists with the username ${username}.` };
        }
    }
    
    if (password !== confirmation) {
        return { result: false, message: "Passwords do not match." };
    }

    if (password.length < 4) {
        return { result: false, message: "Password must be at least 4 characters." };
    }

    return { result: true, message: "Success" };
}

async function validatecreateSquadRequest(squadName) {
    // Check if the squad already exists in the database
    const [squadExists] = await db.query(
        `SELECT COUNT(*) AS count FROM squads WHERE squad_name = ?`,
        [squadName]
    );

    if (squadExists[0].count > 0) {
        return { result: false, message: `An squad already exists with the name ${squadName}.`};
    }

    return { result: true, message: "Success" };
}

async function createHash(password) {
    const salt = await bcrypt.genSalt(8);
    const passwordEncrypted = await bcrypt.hash(password, salt);
    return passwordEncrypted;
}

async function login(server) {
    const { email, password } = await server.body;
    const validation = await validateUser(email, password);
    server.json({ message: validation.message }, validation.result ? 200 : 400);
}

async function validateUser(email, password) {
    try {
        const query = `SELECT * FROM users WHERE email = ?`;

        const [user] = await db.query(query, [email]).asObjects();

        if (!user) {
            return { result: false, message: `User ${email} does not exist` };
        }

        const passwordMatch = await bcrypt.compare(password, user.encrypted_password);

        if (!passwordMatch) {
            return { result: false, message: `Incorrect password` };
        }

        return { result: true, user, message: "Success" };
    } catch (error) {
        console.error("Error validating user:", error);
        return { result: false, message: "An unexpected error occurred." };
    }
}

async function validateUpdateUserRequest(email, password) {
    let validationResult = { result: true, message: "Success" };

    // Validate email if provided
    if (email && !isValidEmail(email)) {
        validationResult = { result: false, message: "Invalid email format" };
    }

    // Validate password if provided
    if (password && password.length < 4) {
        validationResult = { result: false, message: "Password must be at least 4 characters" };
    }

    return validationResult;
}

function isValidEmail(email) {
    // Might have to edit this
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}



console.log(`Server running on http://localhost:${PORT}`);