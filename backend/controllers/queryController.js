// controllers/queryController.js
const appDb = require("../config/appDb");
const { getTargetPool } = require("../services/targetDbConnector");
const { getSchema } = require("../services/schemaFetcher");
const { checkClarity, generateSQL, summarizeResults, analyzeExecutionPlan } = require("../services/aiService");
const { resolveEmbeddings } = require("../services/embeddingService");
const { executeWithRetry } = require("../services/sqlExecutor");
const { isReadOnlyQuery, looksLikeWriteIntent } = require("../middleware/validateSQL");

async function saveHistory({ userId, dbConnectionId, question, sql, rowCount, status, errorMessage }) {
  await appDb.query(
    `INSERT INTO queries (user_id, db_connection_id, natural_language, generated_sql, row_count, status, error_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, dbConnectionId, question, sql, rowCount, status, errorMessage]
  );
}

// POST /api/query — natural language -> AI generates SQL -> runs it
async function handleQuery(req, res) {
  const userId = req.user.id;
  const { question, dbConnectionId } = req.body;

  if (!question || !dbConnectionId) {
    return res.status(400).json({ error: "question and dbConnectionId are required" });
  }

  // Catch write-intent in the English question itself BEFORE any AI call.
  // Without this, "update bob's email" gets treated as merely ambiguous and
  // loops through clarification forever instead of being blocked outright.
  if (looksLikeWriteIntent(question)) {
    return res.status(400).json({
      error: "This looks like a request to change or delete data. This assistant can only read data — try asking a question instead, like \"show...\" or \"what is...\".",
    });
  }

  const connRow = await appDb.query(
    "SELECT * FROM db_connections WHERE id = $1 AND user_id = $2",
    [dbConnectionId, userId]
  );
  const dbConnection = connRow.rows[0];
  if (!dbConnection) return res.status(404).json({ error: "Database connection not found" });

  let targetPool;
  try {
    targetPool = await getTargetPool(dbConnection);
    const schemaText = await getSchema(targetPool);

    const clarity = await checkClarity(question, schemaText);
    if (clarity.clear === false) {
      await targetPool.end();
      return res.json({ needsClarification: true, ...clarity });
    }

    const generated = await generateSQL(question, schemaText);
    let sql = generated.sql || generated; // Fallback if AI ignores JSON format
    const chartConfig = generated.chartConfig || null;

    // Resolve semantic search embeddings before running validation
    sql = await resolveEmbeddings(sql);

    if (!isReadOnlyQuery(sql)) {
      await targetPool.end();
      return res.status(400).json({ error: "Generated query was blocked for safety reasons", sql });
    }

    const result = await executeWithRetry({
      sql,
      targetPool,
      originalQuestion: question,
      schemaText,
    });

    await targetPool.end();

    if (!result.success) {
      await saveHistory({
        userId, dbConnectionId, question,
        sql: result.finalSQL, rowCount: 0, status: "failed", errorMessage: result.error,
      });
      return res.status(500).json({ error: result.error, sql: result.finalSQL, attempts: result.attempts });
    }

    // Plain-English summary of the answer (additive feature, doesn't affect SQL generation)
    let summary = null;
    try {
      summary = await summarizeResults(question, result.data);
    } catch (e) {
      console.error("[summarizeResults Error]", e);
      summary = "Error: " + e.message; 
    }

    await saveHistory({
      userId, dbConnectionId, question,
      sql: result.finalSQL, rowCount: result.data.length, status: "success", errorMessage: null,
    });

    res.json({ sql: result.finalSQL, data: result.data, attempts: result.attempts, summary, chartConfig });
  } catch (err) {
    if (targetPool) await targetPool.end().catch(() => { });
    res.status(500).json({ error: err.message });
  }
}

// POST /api/query/raw — run a user-edited SQL query directly (skips AI generation,
// but still goes through the same safety validation + read-only role + retry-on-error)
async function handleRawQuery(req, res) {
  const userId = req.user.id;
  const { sql: editedSql, question, dbConnectionId } = req.body;

  if (!editedSql || !dbConnectionId) {
    return res.status(400).json({ error: "sql and dbConnectionId are required" });
  }

  if (!isReadOnlyQuery(editedSql)) {
    return res.status(400).json({ error: "Query was blocked for safety reasons (must be a single read-only SELECT)" });
  }

  const connRow = await appDb.query(
    "SELECT * FROM db_connections WHERE id = $1 AND user_id = $2",
    [dbConnectionId, userId]
  );
  const dbConnection = connRow.rows[0];
  if (!dbConnection) return res.status(404).json({ error: "Database connection not found" });

  let targetPool;
  try {
    targetPool = await getTargetPool(dbConnection);

    const result = await targetPool.query(editedSql);
    await targetPool.end();

    let summary = null;
    try {
      summary = await summarizeResults(question || "Run this SQL query", result.rows);
    } catch (e) {
      summary = null;
    }

    await saveHistory({
      userId, dbConnectionId,
      question: question || "(edited SQL)",
      sql: editedSql, rowCount: result.rows.length, status: "success", errorMessage: null,
    });

    res.json({ sql: editedSql, data: result.rows, summary });
  } catch (err) {
    if (targetPool) await targetPool.end().catch(() => { });
    await saveHistory({
      userId, dbConnectionId,
      question: question || "(edited SQL)",
      sql: editedSql, rowCount: 0, status: "failed", errorMessage: err.message,
    });
    res.status(500).json({ error: err.message, sql: editedSql });
  }
}

async function handleExplain(req, res) {
  const userId = req.user.id;
  const { sql, dbConnectionId } = req.body;

  if (!sql || !dbConnectionId) {
    return res.status(400).json({ error: "sql and dbConnectionId are required" });
  }

  if (!isReadOnlyQuery(sql)) {
    return res.status(400).json({ error: "Query was blocked for safety reasons (must be a single read-only SELECT)" });
  }

  const connRow = await appDb.query(
    "SELECT * FROM db_connections WHERE id = $1 AND user_id = $2",
    [dbConnectionId, userId]
  );
  const dbConnection = connRow.rows[0];
  if (!dbConnection) return res.status(404).json({ error: "Database connection not found" });

  let targetPool;
  try {
    targetPool = await getTargetPool(dbConnection);
    const schemaText = await getSchema(targetPool);

    // Run EXPLAIN ANALYZE
    const explainResult = await targetPool.query(`EXPLAIN ANALYZE ${sql}`);
    await targetPool.end();

    const explainOutput = explainResult.rows.map(row => Object.values(row)[0]).join("\\n");
    
    // Analyze with AI
    const analysis = await analyzeExecutionPlan(sql, explainOutput, schemaText);

    res.json({ explainOutput, analysis });
  } catch (err) {
    if (targetPool) await targetPool.end().catch(() => { });
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleQuery, handleRawQuery, handleExplain };