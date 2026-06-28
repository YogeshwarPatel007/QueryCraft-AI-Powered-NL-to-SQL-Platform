// services/promptBuilder.js

function buildClarificationPrompt(userQuestion, schemaText) {
  return `
You are a PostgreSQL assistant. Based on this schema:

${schemaText}

A user asked: "${userQuestion}"

Decide if this question is clear enough to write an exact SQL query.

Respond ONLY with raw JSON (no markdown, no extra text), in one of these two formats:

If clear:
{ "clear": true }

If ambiguous:
{
  "clear": false,
  "reason": "short reason it's unclear",
  "suggestions": [
    { "label": "short human-readable option 1" },
    { "label": "short human-readable option 2" },
    { "label": "short human-readable option 3" }
  ]
}
`;
}

function buildSQLGenerationPrompt(userQuestion, schemaText) {
  return `
You are a PostgreSQL expert. Based on this schema:

${schemaText}

Write a SQL query to answer this question:
"${userQuestion}"

Rules:
1. Write a single SELECT statement. (No INSERT, UPDATE, DELETE, etc.)
2. If the user's question and the resulting data suggest a visual chart would be helpful (e.g., comparing categories, timelines, distributions), suggest a chart configuration.
3. If no chart makes sense, set chartConfig to null.
4. **SEMANTIC SEARCH (pgvector):** If the user asks a "fuzzy" or semantic question (e.g. "similar to", "looks like", "feels like") AND the table has a \`vector\` column, use cosine similarity search. 
   - DO NOT generate the actual float array. Instead, use the exact placeholder format \`[EMBED:search text]\`.
   - Example: \`SELECT * FROM products ORDER BY embedding <=> '[EMBED:cozy winter jacket]' LIMIT 5\`
5. Return ONLY a valid JSON object matching this exact structure, with no markdown block markers (no \`\`\`json):

{
  "sql": "SELECT ...",
  "chartConfig": {
    "type": "bar | line | pie | none",
    "xAxis": "column_name_for_x_axis",
    "yAxis": "column_name_for_y_axis"
  }
}
`;
}

function buildFixPrompt({ originalQuestion, brokenSQL, errorMessage, schemaText }) {
  return `
You wrote this SQL query:
${brokenSQL}

It failed with this error:
${errorMessage}

The user's original request was:
"${originalQuestion}"

Database schema:
${schemaText}

Fix the SQL so it runs successfully and still answers the original request.
Rules:
- Only a single SELECT statement is allowed.
- Return ONLY the corrected raw SQL, no explanation, no markdown formatting.
`;
}

function buildExplainPrompt({ sql, explainOutput, schemaText }) {
  return `
You are an expert PostgreSQL Database Administrator. 
A user is trying to optimize the following SQL query:

\`\`\`sql
${sql}
\`\`\`

Here is the database schema:
${schemaText}

Here is the raw output from EXPLAIN ANALYZE for that query:
${explainOutput}

Analyze the execution plan and provide performance optimization advice. 
If the query is slow because of missing indexes or sequential scans on large tables, explicitly suggest the exact CREATE INDEX statement(s) needed to fix it. 
Keep your explanation concise, professional, and actionable. 
Do not use markdown blocks for the final response, but you can format the SQL index suggestion clearly.
`;
}

module.exports = {
  buildClarificationPrompt,
  buildSQLGenerationPrompt,
  buildFixPrompt,
  buildExplainPrompt,
};
