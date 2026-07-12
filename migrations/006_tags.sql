-- Poster-driven tags: a small canonical tag table plus an entry<->tag join.
-- Counts are computed live from entry_tags (joined against visible entries),
-- so there is no denormalized counter to drift.

CREATE TABLE IF NOT EXISTS tags (
  id         TEXT PRIMARY KEY,   -- url-safe slug, e.g. 'ferries'
  label      TEXT NOT NULL,      -- display label as first written, e.g. 'Ferries'
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_tags (
  entry_id TEXT NOT NULL,
  tag_id   TEXT NOT NULL,
  PRIMARY KEY (entry_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_entry_tags_tag   ON entry_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_entry_tags_entry ON entry_tags(entry_id);
