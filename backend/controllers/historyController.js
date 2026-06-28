// controllers/historyController.js
const appDb = require("../config/appDb");

async function getHistory(req, res) {
  const result = await appDb.query(
    `SELECT q.id, q.natural_language, q.generated_sql, q.row_count, q.status, q.created_at,
            d.connection_name
     FROM queries q
     JOIN db_connections d ON d.id = q.db_connection_id
     WHERE q.user_id = $1
     ORDER BY q.created_at DESC
     LIMIT 100`,
    [req.user.id]
  );
  res.json({ history: result.rows });
}

async function deleteHistoryItem(req, res) {
  const { id } = req.params;
  await appDb.query("DELETE FROM queries WHERE id = $1 AND user_id = $2", [id, req.user.id]);
  res.json({ message: "Deleted" });
}

module.exports = { getHistory, deleteHistoryItem };
