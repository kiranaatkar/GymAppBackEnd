//import assert methods from deno library
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { test, TestSuite } from 'https://deno.land/x/test_suite@0.9.5/mod.ts';
import { sleep } from 'https://deno.land/x/sleep/mod.ts';

const apiURL = 'http://localhost:8080';

let server = undefined;

async function setupServer() {
  const server = await Deno.run({
    cmd: ['deno', 'run', '-A', 'server.js'],
  });
  await sleep(1.5);
  return server;
}

const suite = new TestSuite({
  name: 'Test on scores db',
  async beforeEach() {
    server = await setupServer();
  },
  async afterEach() {
    if (server) {
      await server.close();
      server = undefined;
    }
  },
});


// ----------------------  /squads tests ----------------------

test(suite, '/squads/{squad_id}/users returns all users in a squad.', async () => {
    const squad_id = 1;
    const response = await fetch(`${apiURL}/squads/${squad_id}/users`);
    const json = await response.json();
    assertEquals(json.users.length, 5);
});

test(suite, 'posting valid user successfully adds user to squad.', async () => {
    const userId = 1;
    const squadId = 1;
    const response = await fetch(`${apiURL}/squads/${squadId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
    const json = await response.json();

    // TODO: check length of squad 1's users has increased by 1
    assertEquals(json.status, 200);
});

test(suite, 'posting valid user successfully removes user to squad.', async () => {
    const userId = 1;
    const squadId = 1;
    const response = await fetch(`${apiURL}/squads/${squadId}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
    const json = await response.json();

    // TODO: check length of squad 1's users has decreased by 1
    assertEquals(json.status, 200);
});


// ----------------------  /users tests ----------------------

test(suite, '/users/{user_id}/squads returns all squads a user is part of.', async () => {
    const userId = 1;
    const response = await fetch(`${apiURL}/users/${userId}/squads`);
    const json = await response.json();
    assertEquals(json.squads.length, 2);
});