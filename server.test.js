// //import assert methods from deno library
// import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
// import { test, TestSuite } from 'https://deno.land/x/test_suite@0.9.5/mod.ts';
// import { sleep } from 'https://deno.land/x/sleep/mod.ts';

// const apiURL = 'http://localhost:8080';
// const path = 'server.js';
// let server = undefined;

// async function setupServer() {
//   const server = await Deno.run({
//     cmd: ['deno', 'run', '--unstable', '-A', path],
//   });
//   await sleep(1.5);
//   return server;
// }

// const suite = new TestSuite({
//   name: 'Test on scores db',
//   async beforeEach() {
//     server = await setupServer();
//   },
//   async afterEach() {
//     if (server) {
//       await server.close();
//       server = undefined;
//     }
//   },
// });

// test(suite, '/scores returns all scores in db', async () => {
//   const response = await fetch(`${apiURL}/scores`);
//   const json = await response.json();
//   assertEquals(json.scores.length >= 63, true);
// });

// // ---------- QUERY PARAMS ---------- //

// test(suite, 'word query param works correctly', async () => {
//   const response = await fetch(`${apiURL}/scores?word=rupee`);
//   const json = await response.json();
//   const allScoresContainWord = json.scores.every(
//     (score) => score.word === 'rupee'
//   );
//   assertEquals(allScoresContainWord, true);
// });

// test(suite, 'username query param works correctly', async () => {
//   const response = await fetch(`${apiURL}/scores?username=mixup692`);
//   const json = await response.json();
//   const onlyUserScores = json.scores.every(
//     (score) => score.username === 'mixup692'
//   );
//   assertEquals(onlyUserScores, true);
// });

// test(suite, 'combination of query params works correctly', async () => {
//   const response = await fetch(`${apiURL}/scores?username=mixup692&word=rupee`);
//   const json = await response.json();
//   const conditionsMet = json.scores.every((score) => {
//     return score.username === 'mixup692' && score.word === 'rupee';
//   });
//   assertEquals(conditionsMet, true);
// });

// test(suite, 'invalid query params throw error', async () => {
//   const response = await fetch(`${apiURL}/scores?invalid=query`);
//   const json = await response.json();
//   assertEquals(
//     json.response,
//     'Invalid query params. Allowed params are username, word or date'
//   );
// });

// // ---------- ADDING SCORE ---------- //

// test(suite, 'score adds successfully to db', async () => {
//   const [score, word, username, gameTime] = [2, 'choke', 'cranwell276', 280000];

//   // Add score to db
//   const postRequest = await fetch(`${apiURL}/scores`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       score,
//       word,
//       username,
//       gameTime,
//     }),
//   });

//   // Check if new score in db
//   const postRequestJson = await postRequest.json();
//   assertEquals(postRequestJson.response, 'score successfully added');

//   // Delete test score from db
//   const response = await fetch(`${apiURL}/scores`);
//   const json = await response.json();
//   const newScoreId = json.scores.find(
//     (entry) => entry.username === username
//   ).id;
//   const deleteRequest = await fetch(`${apiURL}/scores/${newScoreId}`, {
//     method: 'DELETE',
//     credentials: 'include',
//     headers: { 'Content-Type': 'application/json' },
//   });
//   const deleteRequestJson = await deleteRequest.json();
//   assertEquals(deleteRequestJson.response, 'score entry deleted');
// });

// test(suite, 'missing entry items throws error', async () => {
//   const [score, word, username, gameTime] = ['', '', 'cranwell276', 28000];

//   const postRequest = await fetch(`${apiURL}/scores`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       score,
//       word,
//       username,
//       gameTime,
//     }),
//   });

//   const postRequestJson = await postRequest.json();
//   assertEquals(
//     postRequestJson.response,
//     'Item(s) missing, need username, word, score and game time for a valid request.'
//   );
// });


// to run: deno test -A server.test.js

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
    console.log("JSON", json)
    assertEquals(json.users.length, 5);
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


// // ----------------------  /users tests ----------------------

test(suite, '/users/{user_id}/squads returns all squads a user is part of.', async () => {
    const userId = 1;
    const response = await fetch(`${apiURL}/users/${userId}/squads`);
    const json = await response.json();
    assertEquals(json.squads.length, 2);
});