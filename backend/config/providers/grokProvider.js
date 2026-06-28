// config/providers/grokProvider.js
// xAI's Grok API is OpenAI-compatible (chat/completions format).

function createGrokProvider(apiKey) {
  return {
    async generateContent(prompt) {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4-latest",
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Grok API error (${response.status}): ${errBody}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    },
  };
}

module.exports = createGrokProvider;