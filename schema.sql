CREATE TABLE IF NOT EXISTS entries (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK(type IN ('wish', 'pain')),
  text        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other',
  votes       INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  user_id     TEXT,
  author_name TEXT,
  image_key   TEXT,
  hidden      INTEGER NOT NULL DEFAULT 0,
  month_year  TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_type_votes ON entries(type, votes DESC);
CREATE INDEX IF NOT EXISTS idx_entries_visible    ON entries(type, hidden, votes DESC);
CREATE INDEX IF NOT EXISTS idx_entries_month      ON entries(month_year, type, votes DESC);
CREATE INDEX IF NOT EXISTS idx_entries_category   ON entries(category, votes DESC);

CREATE TABLE IF NOT EXISTS votes (
  id         TEXT PRIMARY KEY,
  entry_id   TEXT NOT NULL REFERENCES entries(id),
  voter_hash TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,
  asn        TEXT,
  country    TEXT,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique ON votes(entry_id, voter_hash);
CREATE INDEX        IF NOT EXISTS idx_votes_ip     ON votes(entry_id, ip_hash);

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  google_id    TEXT NOT NULL,
  email        TEXT,
  username     TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url   TEXT,
  created_at   INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google ON users(google_id);

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
  hidden      INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_entry ON comments(entry_id, created_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  key        TEXT PRIMARY KEY,
  count      INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);

CREATE TABLE IF NOT EXISTS tags (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_tags (
  entry_id TEXT NOT NULL,
  tag_id   TEXT NOT NULL,
  PRIMARY KEY (entry_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_entry_tags_tag   ON entry_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_entry_tags_entry ON entry_tags(entry_id);
