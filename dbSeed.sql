BEGIN TRANSACTION;

INSERT INTO squads(squad_name, squad_description, created_at, updated_at) 
VALUES 
    ('Squad A', 'Description of Squad A', datetime('now'), datetime('now')),
    ('Squad B', 'Description of Squad B', datetime('now'), datetime('now')),
    ('Squad C', 'Description of Squad C', datetime('now'), datetime('now')),
    ('Squad D', 'Description of Squad D', datetime('now'), datetime('now'));

COMMIT;


-- Insert users
INSERT INTO users(username, email, encrypted_password, created_at, updated_at) 
VALUES 
    ('user1', 'user1@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu', datetime('now'), datetime('now')),
    ('user2', 'user2@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu', datetime('now'), datetime('now')),
    ('user3', 'user3@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu', datetime('now'), datetime('now'));


-- Insert memberships
-- User 1 belongs to Squad A and Squad B
INSERT INTO memberships(user_id, squad_id, created_at, updated_at) 
VALUES 
    (1, 1, datetime('now'), datetime('now')),  -- User 1 in Squad A
    (1, 2, datetime('now'), datetime('now'));  -- User 1 in Squad B

-- User 2 belongs to Squad A
INSERT INTO memberships(user_id, squad_id, created_at, updated_at) 
VALUES 
    (2, 1, datetime('now'), datetime('now'));  -- User 2 in Squad A

-- User 3 belongs to Squad C
INSERT INTO memberships(user_id, squad_id, created_at, updated_at) 
VALUES 
    (3, 3, datetime('now'), datetime('now'));  -- User 3 in Squad C
