-- Keep a copy of every uploaded / received file in the database so media survives
-- hosts with ephemeral disks (e.g. Hostinger Business/Cloud Node.js web apps).
ALTER TABLE media ADD COLUMN IF NOT EXISTS data bytea;
CREATE INDEX IF NOT EXISTS media_path_idx ON media (path);
