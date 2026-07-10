ALTER TABLE entries ADD COLUMN comment_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE entries ADD COLUMN user_id     TEXT;
ALTER TABLE entries ADD COLUMN author_name TEXT;
ALTER TABLE entries ADD COLUMN image_key   TEXT;

CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category, votes DESC);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,
  entry_id    TEXT NOT NULL REFERENCES entries(id),
  user_id     TEXT,
  author_name TEXT NOT NULL,
  body        TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_entry ON comments(entry_id, created_at);
