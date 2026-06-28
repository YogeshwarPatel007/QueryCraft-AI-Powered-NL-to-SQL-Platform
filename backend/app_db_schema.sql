-- =========================================================
-- RUN THIS IN YOUR APP DATABASE (the Neon project for users/history)
-- This is SEPARATE from the target database that holds real business data.
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Each user can save multiple "target database" connections
CREATE TABLE IF NOT EXISTS db_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL,
  db_type TEXT NOT NULL DEFAULT 'postgres',   -- 'postgres' for now
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  db_name TEXT NOT NULL,
  username TEXT NOT NULL,                      -- should be a READ-ONLY role on the target DB
  encrypted_password TEXT NOT NULL,             -- AES-256 encrypted, never plain text
  ssl_required BOOLEAN DEFAULT TRUE,
  alert_check_interval_minutes INTEGER DEFAULT 1440,
  last_alert_check_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Query history
CREATE TABLE IF NOT EXISTS queries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  db_connection_id INTEGER REFERENCES db_connections(id) ON DELETE CASCADE,
  natural_language TEXT NOT NULL,
  generated_sql TEXT,
  row_count INTEGER,
  status TEXT,                -- 'success' or 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Proactive alerts
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  db_connection_id INTEGER REFERENCES db_connections(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  explanation TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  steps JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_conn ON alerts(db_connection_id);
