// services/schemaBrowser.js
// Read-only inspection helpers for the Schema Browser UI.
// Uses the same short-lived, read-only target pool as everything else.

async function listTables(targetPool) {
  const result = await targetPool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  return result.rows.map((r) => r.table_name);
}

async function getTableColumns(targetPool, tableName) {
  const result = await targetPool.query(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position;`,
    [tableName]
  );
  return result.rows;
}

async function previewTable(targetPool, tableName, limit = 10) {
  // Table name can't be parameterized directly in Postgres, so we whitelist
  // it against the actual list of tables before interpolating.
  const tables = await listTables(targetPool);
  if (!tables.includes(tableName)) {
    throw new Error("Table not found");
  }
  const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
  const result = await targetPool.query(
    `SELECT * FROM "${tableName}" LIMIT ${safeLimit};`
  );
  return result.rows;
}

module.exports = { listTables, getTableColumns, previewTable };