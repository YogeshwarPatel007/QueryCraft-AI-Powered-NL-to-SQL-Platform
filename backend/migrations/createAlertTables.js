// migrations/createAlertTables.js
// Run once: node migrations/createAlertTables.js
// Adds alert columns to db_connections and creates the alerts table.

const appDb = require("../config/appDb");

async function migrate() {
  console.log("Creating alert tables and columns...");

  // Add columns to db_connections
  await appDb.query(`
    ALTER TABLE db_connections 
    ADD COLUMN IF NOT EXISTS alert_check_interval_minutes INTEGER DEFAULT 1440,
    ADD COLUMN IF NOT EXISTS last_alert_check_at TIMESTAMP;
  `);

  // Create alerts table
  await appDb.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      db_connection_id INTEGER NOT NULL REFERENCES db_connections(id) ON DELETE CASCADE,
      headline TEXT NOT NULL,
      explanation TEXT NOT NULL,
      suggested_action TEXT NOT NULL,
      steps JSONB,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await appDb.query(`
    CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
  `);

  await appDb.query(`
    CREATE INDEX IF NOT EXISTS idx_alerts_conn ON alerts(db_connection_id);
  `);

  console.log("✅ Alert tables and columns created successfully.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
