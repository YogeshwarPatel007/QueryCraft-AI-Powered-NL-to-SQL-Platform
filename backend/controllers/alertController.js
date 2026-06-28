// controllers/alertController.js
const appDb = require("../config/appDb");
const { checkAndRunAlerts } = require("../services/alertDetectionService");

// POST /api/alerts/check
async function triggerCheck(req, res) {
  // Fire and forget - do not block the frontend response
  checkAndRunAlerts(req.user.id).catch((err) => {
    console.error("Background alert check failed:", err);
  });
  
  res.json({ success: true, message: "Alert check initiated in background" });
}

// GET /api/alerts
async function listAlerts(req, res) {
  try {
    const result = await appDb.query(`
      SELECT a.*, c.connection_name 
      FROM alerts a
      JOIN db_connections c ON a.db_connection_id = c.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
      LIMIT 50
    `, [req.user.id]);
    
    const unreadCount = result.rows.filter(r => !r.is_read).length;
    
    res.json({ alerts: result.rows, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/alerts/:id/read
async function markRead(req, res) {
  try {
    await appDb.query(
      "UPDATE alerts SET is_read = true WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { triggerCheck, listAlerts, markRead };
