import { Application } from "https://deno.land/x/abc/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

// denon run --allow-net --allow-read --allow-write server.js

const db = new DB("gymApp.db");
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