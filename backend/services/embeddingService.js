const aiClient = require("../config/aiProvider");

// Wait, the aiProvider is configured for text generation (which could be anthropic, gemini, or grok).
// Our embeddings specifically use Gemini because it's free and we have the key.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getEmbedding(text) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required for semantic search");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
    }),
  });
  const data = await response.json();
  if (!data.embedding?.values) {
    throw new Error("Failed to get embedding: " + JSON.stringify(data));
  }
  return data.embedding.values;
}

/**
 * Scans a SQL string for the pattern [EMBED:some text]
 * and replaces it with the actual vector string representation '[0.12, 0.45, ...]'
 * suitable for pgvector.
 */
async function resolveEmbeddings(sql) {
  const embedRegex = /\[EMBED:(.*?)\]/g;
  
  if (!embedRegex.test(sql)) {
    return sql;
  }

  // Reset regex index after testing
  embedRegex.lastIndex = 0;

  let resolvedSql = sql;
  let match;
  
  // We need to resolve these sequentially or in parallel.
  // For simplicity, sequentially replace them.
  while ((match = embedRegex.exec(resolvedSql)) !== null) {
    const fullMatch = match[0]; // e.g. "[EMBED:cozy winter jacket]"
    const textToEmbed = match[1]; // e.g. "cozy winter jacket"
    
    try {
      const vector = await getEmbedding(textToEmbed);
      // Format as pgvector string: '[0.1, 0.2, ...]'
      const vectorString = `'[${vector.join(",")}]'`;
      resolvedSql = resolvedSql.replace(fullMatch, vectorString);
    } catch (e) {
      console.error("Embedding error:", e);
      // On failure, replace with a dummy zero vector to prevent SQL syntax errors,
      // though the query results will be meaningless.
      const zeroVector = `'[${new Array(3072).fill(0).join(",")}]'`;
      resolvedSql = resolvedSql.replace(fullMatch, zeroVector);
    }
  }

  return resolvedSql;
}

module.exports = { resolveEmbeddings };
