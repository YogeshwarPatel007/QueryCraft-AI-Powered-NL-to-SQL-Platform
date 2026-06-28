// middleware/validateSQL.js
// App-level safety check. This is layer 1 of 2.
// Layer 2 is the database-level read-only role (readonly_ai_user) — see target_db_schema.sql

const FORBIDDEN_KEYWORDS = [
  "INSERT", "UPDATE", "DELETE", "DROP", "ALTER",
  "TRUNCATE", "CREATE", "GRANT", "REVOKE", "EXEC",
  "MERGE", "CALL",
];

function isReadOnlyQuery(sql) {
  if (!sql || typeof sql !== "string") return false;

  const cleaned = sql.trim().toUpperCase();

  if (!cleaned.startsWith("SELECT") && !cleaned.startsWith("WITH")) {
    return false;
  }

  for (const keyword of FORBIDDEN_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(sql)) return false;
  }

  const statementCount = sql.split(";").filter((s) => s.trim().length > 0).length;
  if (statementCount > 1) return false;

  return true;
}

// Detects write-intent in the user's ENGLISH question itself, before any AI
// call happens. This stops the clarification loop from spinning forever on
// requests like "update bob's email" — these get blocked immediately
// with a clear message instead of being treated as an ambiguous-but-valid
// question that just needs a more specific rephrasing.
const WRITE_INTENT_PHRASES = [
  "update", "delete", "remove", "insert", "add a ", "add an ",
  "drop ", "modify", "change the", "edit ", "alter ", "truncate", "set the",
];

function looksLikeWriteIntent(englishQuestion) {
  const lower = englishQuestion.toLowerCase();
  return WRITE_INTENT_PHRASES.some((phrase) => lower.includes(phrase));
}

module.exports = { isReadOnlyQuery, looksLikeWriteIntent };