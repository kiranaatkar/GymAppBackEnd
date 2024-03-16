

import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { test, TestSuite } from 'https://deno.land/x/test_suite@0.9.5/mod.ts';
import { sleep } from 'https://deno.land/x/sleep/mod.ts';

const apiURL = 'http://localhost:8080';

let server: Deno.Process | undefined = undefined;

async function setupServer() {
    const serverProcess = await Deno.run({
        cmd: ['deno', 'run', '-A', 'server.ts'],
    });
    await sleep(1.5);
    return serverProcess;
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

test(suite, '/squads/{squadId}/users returns all users in a squad.', async () => {
    const squadId = 1;
    const response = await fetch(`${apiURL}/squads/${squadId}/users`);
    const json = await response.json();
    console.log(json)
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

    // TODO: check length of squad 1's users has increased by 1
    assertEquals(response.status, 200);
});

// test(suite, 'posting valid user successfully removes user to squad.', async () => {
//     const userId = 1;
//     const squadId = 1;
//     const response = await fetch(`${apiURL}/squads/${squadId}/remove`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ userId }),
//       });
//     const json = await response.json();

//     // TODO: check length of squad 1's users has decreased by 1
//     assertEquals(json.status, 200);
// });


// // // ----------------------  /users tests ----------------------

// test(suite, '/users/{user_id}/squads returns all squads a user is part of.', async () => {
//     const userId = 1;
//     const response = await fetch(`${apiURL}/users/${userId}/squads`);
//     const json = await response.json();
//     assertEquals(json.squads.length, 2);
// });