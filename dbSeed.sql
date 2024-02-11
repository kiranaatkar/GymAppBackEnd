
INSERT INTO projects(title, created_by, due_date, description, created_at, updated_at) VALUES ('Blackjack', 1, datetime('2022-09-06'), "Making various versions of the game Blackjack.", datetime('now'), datetime('now'));
INSERT INTO projects(title, created_by, due_date, description, created_at, updated_at) VALUES ('Workflow Management', 1, datetime('2022-03-04'), "Creating work flow management software.", datetime('now'), datetime('now'));

INSERT INTO tasks(project_id, created_by, description, due_date, complete) VALUES (1, 1, "Create commandline blackjack", null, 1);
INSERT INTO tasks(project_id, created_by, description, due_date, complete) VALUES (1, 1, "Create OOP commandline blackjack", null, 1);
INSERT INTO tasks(project_id, created_by, description, due_date, complete) VALUES (1, 1, "Create OOP browser blackjack", null, 1);

INSERT INTO tasks(project_id, created_by, description, due_date, complete) VALUES (2, 1, "Create form input for new project", null, 1);
INSERT INTO tasks(project_id, created_by, description, due_date, complete) VALUES (2, 1, "Create bnackend to store and fetch projects", null, 1);
INSERT INTO tasks(project_id, created_by, description, due_date, complete) VALUES (2, 1, "Create teams system", null, 0);

INSERT INTO users(id, email, encrypted_password, created_at, updated_at) VALUES (1, 'kiranaatkar@gmail.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu',  datetime('now'), datetime('now'))