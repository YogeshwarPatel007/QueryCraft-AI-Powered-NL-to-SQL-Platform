// services/aiService.js
// IMPORTANT: This file NEVER imports a database driver and NEVER receives
// real credentials. It only sends/receives plain text to/from the AI provider.
// It also doesn't know or care WHICH provider is active — that's decided
// entirely in config/aiProvider.js based on the AI_PROVIDER env var.

const aiClient = require("../config/aiProvider");
const {
  buildClarificationPrompt,
  buildSQLGenerationPrompt,
  buildFixPrompt,
  buildExplainPrompt,
} = require("./promptBuilder");

function stripMarkdown(text) {
  return text.replace(/```sql|```json|```/g, "").trim();
}

async function checkClarity(userQuestion, schemaText) {
  const prompt = buildClarificationPrompt(userQuestion, schemaText);
  const text = await aiClient.generateContent(prompt);

  const cleaned = stripMarkdown(text);
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return { clear: true };
  }
}

async function generateSQL(userQuestion, schemaText) {
  const prompt = buildSQLGenerationPrompt(userQuestion, schemaText);
  const text = await aiClient.generateContent(prompt);
  const cleaned = stripMarkdown(text);
  
  try {
    const parsed = JSON.parse(cleaned);
    return parsed; // { sql, chartConfig }
  } catch (e) {
    // Fallback if AI ignores JSON instructions
    return { sql: cleaned, chartConfig: null };
  }
}

async function fixSQL({ originalQuestion, brokenSQL, errorMessage, schemaText }) {
  const prompt = buildFixPrompt({ originalQuestion, brokenSQL, errorMessage, schemaText });
  const text = await aiClient.generateContent(prompt);
  return stripMarkdown(text);
}

async function summarizeResults(userQuestion, rows) {
  if (!rows || rows.length === 0) {
    return "No rows matched this question.";
  }

  const sample = rows.slice(0, 15);
  const prompt = `
A user asked: "${userQuestion}"

Here are the resulting rows (JSON), possibly truncated to a sample:
${JSON.stringify(sample)}

Total rows returned: ${rows.length}

Write a short, plain-English summary (1-3 sentences) of what this data shows,
as if explaining the answer to the user's question. No SQL, no markdown, no bullet points.
`;

  const text = await aiClient.generateContent(prompt);
  return stripMarkdown(text);
}

async function analyzeExecutionPlan(sql, explainOutput, schemaText) {
  const prompt = buildExplainPrompt({ sql, explainOutput, schemaText });
  const text = await aiClient.generateContent(prompt);
  return stripMarkdown(text);
}

module.exports = { checkClarity, generateSQL, fixSQL, summarizeResults, analyzeExecutionPlan };