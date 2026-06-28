// services/sqlExecutor.js
const { fixSQL } = require("./aiService");

const MAX_RETRIES = 3;

async function executeWithRetry({
  sql,
  targetPool,
  originalQuestion,
  schemaText,
  retries = 0,
}) {
  try {
    const result = await targetPool.query(sql);
    return { success: true, data: result.rows, finalSQL: sql, attempts: retries };
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      return {
        success: false,
        error: error.message,
        finalSQL: sql,
        attempts: retries,
      };
    }

    const fixedSQL = await fixSQL({
      originalQuestion,
      brokenSQL: sql,
      errorMessage: error.message,
      schemaText,
    });

    return executeWithRetry({
      sql: fixedSQL,
      targetPool,
      originalQuestion,
      schemaText,
      retries: retries + 1,
    });
  }
}

module.exports = { executeWithRetry };
