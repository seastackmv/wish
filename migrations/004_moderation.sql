ALTER TABLE entries  ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE comments ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_entries_visible ON entries(type, hidden, votes DESC);
