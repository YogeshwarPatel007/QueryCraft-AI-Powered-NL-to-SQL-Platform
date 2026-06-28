// services/schemaFetcher.js
// Reads ONLY the structure (table/column names) of the target database.
// Never reads actual row data here.

async function getSchema(targetPool) {
  const result = await targetPool.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  const schemaMap = {};
  result.rows.forEach((row) => {
    if (!schemaMap[row.table_name]) schemaMap[row.table_name] = [];
    schemaMap[row.table_name].push(`${row.column_name} (${row.data_type})`);
  });

  let schemaText = "";
  for (const table in schemaMap) {
    schemaText += `Table: ${table}\nColumns: ${schemaMap[table].join(", ")}\n\n`;
  }

  return schemaText.trim();
}

module.exports = { getSchema };
