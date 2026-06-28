// config/providers/geminiProvider.js
const { GoogleGenAI } = require("@google/genai");

function createGeminiProvider(apiKey) {
  const client = new GoogleGenAI({ apiKey });

  return {
    async generateContent(prompt) {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    },
  };
}

module.exports = createGeminiProvider;