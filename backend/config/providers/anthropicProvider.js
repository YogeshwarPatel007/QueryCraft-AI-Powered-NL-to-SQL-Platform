// config/providers/anthropicProvider.js
// Calls Anthropic's Messages API directly (no SDK dependency needed).

function createAnthropicProvider(apiKey) {
    return {
        async generateContent(prompt) {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-5",
                    max_tokens: 1024,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
            }

            const data = await response.json();
            return data.content?.[0]?.text || "";
        },
    };
}

module.exports = createAnthropicProvider;