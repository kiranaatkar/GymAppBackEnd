-- Drop existing tables if they exist (for a clean setup)
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS squads CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the squads table
CREATE TABLE squads (
    id SERIAL PRIMARY KEY,
    squad_name VARCHAR(50) NOT NULL,
    squad_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the memberships table
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    squad_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE
);

-- Create the visits table
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert squads
INSERT INTO squads(squad_name, squad_description) 
VALUES 
    ('Squad A', 'Description of Squad A'),
    ('Squad B', 'Description of Squad B'),
    ('Squad C', 'Description of Squad C'),
    ('Squad D', 'Description of Squad D');

-- Insert users
INSERT INTO users(username, email, encrypted_password) 
VALUES 
    ('user1', 'user1@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu'),
    ('user2', 'user2@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu'),
    ('user3', 'user3@example.com', '$2a$08$d5Nxcj/0pkez0tmVb4CZWOcRcb4eGvo.8OOSU75ptOgZPbk7c.Kyu');

-- Insert memberships
INSERT INTO memberships(user_id, squad_id) 
VALUES 
    (1, 1),
    (1, 2),
    (2, 1),
    (3, 3);

-- Insert visits
INSERT INTO visits(user_id, visit_date)
VALUES 
    (1, CURRENT_TIMESTAMP),
    (2, CURRENT_TIMESTAMP),
    (3, CURRENT_TIMESTAMP),
    (1, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (1, CURRENT_TIMESTAMP - INTERVAL '2 days');
