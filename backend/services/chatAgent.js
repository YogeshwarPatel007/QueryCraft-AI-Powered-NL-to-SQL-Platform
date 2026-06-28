// services/chatAgent.js
const aiClient = require("../config/aiProvider");
const { isReadOnlyQuery } = require("../middleware/validateSQL");

function stripMarkdown(text) {
  return text.replace(/```sql|```json|```/g, "").trim();
}

/**
 * Runs the Analyst Agent logic (planning, safe execution, synthesis)
 * @param {string} message - User's question or prompt
 * @param {string} historyContext - Stringified history
 * @param {string} schemaText - Database schema
 * @param {object} targetPool - PostgreSQL pool for the target database
 * @param {string} synthesisInstruction - Optional instruction to append to the synthesis prompt
 * @returns {object} { answer, steps }
 */
async function runAnalystAgent(message, historyContext, schemaText, targetPool, synthesisInstruction = "") {
  // ── Step 1: AI breaks the question into sub-queries ──────────
  const planPrompt = `You are a data analyst. The user asked: "${message}"

${historyContext ? `Recent conversation context:\n${historyContext}\n` : ""}
The database schema is:
${schemaText}

Based on this, break the question into 1-4 specific sub-questions that can each be answered with a single SQL SELECT query.
Return ONLY a JSON array like: [{"subQuestion": "...", "sql": "SELECT ..."}]
Important:
- Only generate SELECT queries (no INSERT, UPDATE, DELETE, DROP, etc.)
- Each SQL must be a valid PostgreSQL SELECT query
- Keep sub-questions focused and answerable with one query each
- Return valid JSON only, no other text`;

  const planText = await aiClient.generateContent(planPrompt);
  const cleanedPlan = stripMarkdown(planText);

  let plan;
  try {
    plan = JSON.parse(cleanedPlan);
  } catch (e) {
    throw new Error("AI returned an invalid query plan. Please try rephrasing your question.");
  }

  if (!Array.isArray(plan) || plan.length === 0) {
    throw new Error("AI could not break this question into queries. Try being more specific.");
  }

  // ── Step 2: Execute each sub-query safely ────────────────────
  const steps = [];
  for (const step of plan) {
    const stepResult = { subQuestion: step.subQuestion, sql: step.sql, result: null, error: null };

    if (!isReadOnlyQuery(step.sql)) {
      stepResult.error = "Query blocked — only SELECT queries are allowed";
      steps.push(stepResult);
      continue;
    }

    try {
      const qResult = await targetPool.query(step.sql);
      stepResult.result = qResult.rows.slice(0, 50); // cap at 50 rows per sub-query
    } catch (err) {
      stepResult.error = err.message;
    }
    steps.push(stepResult);
  }

  // ── Step 3: AI synthesizes the final answer ──────────────────
  const successfulSteps = steps.filter((s) => s.result && !s.error);
  const subResultsSummary = successfulSteps
    .map((s, i) => `Sub-question ${i + 1}: "${s.subQuestion}"\nResult: ${JSON.stringify(s.result.slice(0, 15))}`)
    .join("\n\n");

  let answer;
  if (successfulSteps.length === 0) {
    answer = "I wasn't able to run any queries successfully. Please try rephrasing your question.";
  } else {
    const synthesisPrompt = `Here is the user's original question: "${message}"

Here are the sub-query results:
${subResultsSummary}

Write a clear, concise plain-English answer synthesizing all of this.
2-4 sentences max. Be specific with numbers and names from the data.
No SQL, no markdown, no bullet points.
${synthesisInstruction}`;

    const answerText = await aiClient.generateContent(synthesisPrompt);
    answer = stripMarkdown(answerText);
  }

  return { answer, steps };
}

module.exports = { runAnalystAgent };
