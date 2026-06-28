require("dotenv").config();

const createGeminiProvider = require("./providers/geminiProvider");
const createGrokProvider = require("./providers/grokProvider");
const createAnthropicProvider = require("./providers/anthropicProvider");

const PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();

let aiClient;

if (PROVIDER === "gemini") {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI_PROVIDER is 'gemini' but GEMINI_API_KEY is missing in .env");
  }
  aiClient = createGeminiProvider(process.env.GEMINI_API_KEY);
} else if (PROVIDER === "grok") {
  if (!process.env.GROK_API_KEY) {
    throw new Error("AI_PROVIDER is 'grok' but GROK_API_KEY is missing in .env");
  }
  aiClient = createGrokProvider(process.env.GROK_API_KEY);
} else if (PROVIDER === "anthropic" || PROVIDER === "claude") {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("AI_PROVIDER is 'anthropic' but ANTHROPIC_API_KEY is missing in .env");
  }
  aiClient = createAnthropicProvider(process.env.ANTHROPIC_API_KEY);
} else {
  throw new Error(`Unknown AI_PROVIDER "${PROVIDER}". Use "gemini", "grok", or "anthropic".`);
}

console.log(`[QueryMind] AI provider active: ${PROVIDER}`);

module.exports = aiClient;