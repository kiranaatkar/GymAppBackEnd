

import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { test, TestSuite } from 'https://deno.land/x/test_suite@0.9.5/mod.ts';
import { sleep } from 'https://deno.land/x/sleep/mod.ts';
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const apiURL: string = 'http://localhost:8080';
const dbName: string = "gymAppTest.db"

let server: Deno.Process | undefined = undefined;

const suite = new TestSuite({
    name: 'Test on scores db',
    async beforeEach() {
        await createTestDb();
        await dbSeed();
        server = await setupServer();
    },
    async afterEach() {
      if (server) {
          await server.close();
          await Deno.remove(dbName);
          server = undefined;
      }
  },  
});

// ----------------------  /squads tests ----------------------

test(suite, '/squads/{squadId}/users returns all users in a squad.', async () => {
    const squadId = 1;
    const response = await fetch(`${apiURL}/squads/${squadId}/users`);
    const json = await response.json();
    assertEquals(json.users.length, 2);
});

test(suite, 'posting valid user successfully adds user to squad.', async () => {
    const userId = 1;
    const squadId = 1;
    const response = await fetch(`${apiURL}/squads/${squadId}/addUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

    try {
        // TODO: check length of squad 1's users has increased by 1
        assertEquals(response.status, 200);
    } finally {
        // Consume the body to release associated resources
        if (response.body) {
          await response.body.cancel();
      }
    }
});

test(suite, 'posting valid user successfully removes user to squad.', async () => {
    const userId = 1;
    const squadId = 1;
    const response = await fetch(`${apiURL}/squads/${squadId}/removeUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

    try {
      // TODO: check length of squad 1's users has decreased by 1
      assertEquals(response.status, 200);
  } finally {
      // Consume the body to release associated resources
      if (response.body) {
        await response.body.cancel();
    }
  }
});


// ----------------------  /users tests ----------------------

test(suite, '/users create user post succeeds.', async () => {
  const email = "user@example.com"
  const username = "testUser"
  const password = "mynamejeff123"
  const confirmation = "mynamejeff123"
  const response = await fetch(`${apiURL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password, confirmation }),
  });
  assertEquals(response.status, 200);
  const json = await response.json();
  assertEquals(json.message, "User created successfully");
  assertEquals(json.user.email, email);
  assertEquals(json.user.username, username)
});

test(suite, '/users create user post fails for duplicate username.', async () => {
  const email = "user@example.com"
  const username = "user1"
  const password = "mynamejeff123"
  const confirmation = "mynamejeff123"
  const response = await fetch(`${apiURL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password, confirmation }),
  });
  assertEquals(response.status, 400);
  const json = await response.json();
  assertEquals(json.message, "An account already exists with the username user1.");
});

test(suite, '/users create user post fails for password confirmation mismatch.', async () => {
  const email = "user@example.com"
  const username = "testUser"
  const password = "mynamejeff123"
  const confirmation = "deeznuts"
  const response = await fetch(`${apiURL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username, password, confirmation }),
  });
  assertEquals(response.status, 400);
  const json = await response.json();
  assertEquals(json.message, "Passwords do not match.");
});

test(suite, '/users/{user_id}/squads returns all squads a user is part of.', async () => {
    const userId = 1;
    const response = await fetch(`${apiURL}/users/${userId}/squads`);
    const json = await response.json();
    assertEquals(json.squads.length, 2);
});


// HELPER METHODS

async function dbSeed() {
  const db = new DB(`./${dbName}`);
  const sqlCommands = [
      "BEGIN TRANSACTION;",
      "INSERT INTO squads(squad_name, squad_description, created_at, updated_at) VALUES ('Squad A', 'Description of Squad A', datetime('now'), datetime('now')), ('Squad B', 'Description of Squad B', datetime('now'), datetime('now')), ('Squad C', 'Description of Squad C', datetime('now'), datetime('now')), ('Squad D', 'Description of Squad D', datetime('now'), datetime('now'));",
      "INSERT INTO users(username, email, encrypted_password, created_at, updated_at) VALUES ('user1', 'user1@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu', datetime('now'), datetime('now')), ('user2', 'user2@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu', datetime('now'), datetime('now')), ('user3', 'user3@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu', datetime('now'), datetime('now'));",
      "INSERT INTO memberships(user_id, squad_id, created_at, updated_at) VALUES (1, 1, datetime('now'), datetime('now')), (1, 2, datetime('now'), datetime('now')), (2, 1, datetime('now'), datetime('now')), (3, 3, datetime('now'), datetime('now'));",
      "COMMIT;"
  ];

  sqlCommands.forEach(async (command) => await db.query(command));
  await db.close();
}

async function createTestDb() {
  const dbSchemaProcess = await Deno.run({
    cmd: ["deno", "run", "--allow-read", "--allow-write", "dbSchema.js"],
  });
  const status = await dbSchemaProcess.status();
  if (!status.success) {
      throw new Error(`Failed to run createTestDb: ${status.code}`);
  }
  await dbSchemaProcess.close()
}

async function setupServer() {
    const serverProcess = await Deno.run({
        cmd: ['deno', 'run', '-A', 'server.ts'],
    });
    await sleep(1.5);
    return serverProcess;
}


// to run: deno test -A server.test.ts