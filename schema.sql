-- SAGE Database Schema (v2 — with user accounts + sessions)

CREATE TABLE IF NOT EXISTS interactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL,
    action_type TEXT NOT NULL,
    input_text  TEXT,
    response    TEXT,
    timestamp   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id          TEXT PRIMARY KEY,
    age              INTEGER,
    education        TEXT,
    smartphone_use   TEXT,
    confidence_score INTEGER,
    difficulty_level TEXT,
    created_at       TEXT
);

-- Registered user accounts (for the /user login page)
CREATE TABLE IF NOT EXISTS registered_users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT UNIQUE NOT NULL,
    password     TEXT NOT NULL,
    display_name TEXT,
    email        TEXT,
    created_at   TEXT NOT NULL,
    last_login   TEXT
);

-- Active browser sessions log
CREATE TABLE IF NOT EXISTS user_sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT NOT NULL,
    login_at   TEXT NOT NULL,
    logout_at  TEXT,
    ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(action_type);
CREATE INDEX IF NOT EXISTS idx_sessions_user      ON user_sessions(user_id);
