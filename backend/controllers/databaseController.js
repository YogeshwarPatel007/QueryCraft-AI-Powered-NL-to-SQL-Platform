// controllers/databaseController.js
const appDb = require("../config/appDb");
const { encrypt } = require("../utils/encrypt");
const { getTargetPool } = require("../services/targetDbConnector");
const { listTables, getTableColumns, previewTable } = require("../services/schemaBrowser");

// Add a new target database connection
async function addConnection(req, res) {
  try {
    const userId = req.user.id;
    const { connection_name, host, port, db_name, username, password, ssl_required } = req.body;

    if (!connection_name || !host || !db_name || !username || !password) {
      return res.status(400).json({ error: "Missing required connection fields" });
    }

    const encryptedPassword = encrypt(password);

    const result = await appDb.query(
      `INSERT INTO db_connections
        (user_id, connection_name, db_type, host, port, db_name, username, encrypted_password, ssl_required, alert_check_interval_minutes)
       VALUES ($1, $2, 'postgres', $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, connection_name, host, port, db_name, alert_check_interval_minutes, created_at`,
      [userId, connection_name, host, port || 5432, db_name, username, encryptedPassword, ssl_required !== false, req.body.alert_check_interval_minutes || 1440]
    );

    res.json({ connection: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// List all connections for the logged-in user (never returns passwords)
async function listConnections(req, res) {
  const result = await appDb.query(
    `SELECT id, connection_name, host, port, db_name, db_type, alert_check_interval_minutes, created_at
     FROM db_connections WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ connections: result.rows });
}

// Test a connection before saving (optional helper endpoint)
async function testConnection(req, res) {
  try {
    const { host, port, db_name, username, password, ssl_required } = req.body;
    const tempPool = await getTargetPool({
      host,
      port: port || 5432,
      db_name,
      username,
      encrypted_password: encrypt(password), // reuse same decrypt path
      ssl_required: ssl_required !== false,
    });

    await tempPool.query("SELECT 1");
    await tempPool.end();

    res.json({ success: true, message: "Connection successful" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function deleteConnection(req, res) {
  const { id } = req.params;
  await appDb.query("DELETE FROM db_connections WHERE id = $1 AND user_id = $2", [id, req.user.id]);
  res.json({ message: "Connection deleted" });
}

// Helper: look up a connection owned by this user, return its short-lived target pool
async function getOwnedTargetPool(userId, connectionId) {
  const row = await appDb.query(
    "SELECT * FROM db_connections WHERE id = $1 AND user_id = $2",
    [connectionId, userId]
  );
  const dbConnection = row.rows[0];
  if (!dbConnection) return null;
  return await getTargetPool(dbConnection);
}

// GET /api/databases/:id/tables — list all tables (structure only, no row data)
async function getTables(req, res) {
  const { id } = req.params;
  let targetPool;
  try {
    targetPool = await getOwnedTargetPool(req.user.id, id);
    if (!targetPool) return res.status(404).json({ error: "Connection not found" });

    const tables = await listTables(targetPool);
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (targetPool) await targetPool.end().catch(() => {});
  }
}

// GET /api/databases/:id/tables/:table — columns + a small preview (5-10 rows)
async function getTableDetail(req, res) {
  const { id, table } = req.params;
  const limit = req.query.limit || 10;
  let targetPool;
  try {
    targetPool = await getOwnedTargetPool(req.user.id, id);
    if (!targetPool) return res.status(404).json({ error: "Connection not found" });

    const columns = await getTableColumns(targetPool, table);
    const rows = await previewTable(targetPool, table, limit);
    res.json({ columns, rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  } finally {
    if (targetPool) await targetPool.end().catch(() => {});
  }
}

// PATCH /api/databases/:id/interval
async function updateConnectionInterval(req, res) {
  try {
    const { id } = req.params;
    const { alert_check_interval_minutes } = req.body;
    await appDb.query(
      "UPDATE db_connections SET alert_check_interval_minutes = $1 WHERE id = $2 AND user_id = $3",
      [alert_check_interval_minutes, id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  addConnection,
  listConnections,
  testConnection,
  deleteConnection,
  getTables,
  getTableDetail,
  updateConnectionInterval,
};