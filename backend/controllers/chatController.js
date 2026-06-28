// controllers/chatController.js
// Backend for the Analyst Chat agent loop:
//   1. Receives user message + connectionId
//   2. AI breaks the question into sub-queries
//   3. Each sub-query runs through the safe read-only pipeline
//   4. AI synthesizes a final answer from all sub-results
//   5. Everything is persisted to conversations + chat_messages tables

const appDb = require("../config/appDb");
const { getTargetPool } = require("../services/targetDbConnector");
const { getSchema } = require("../services/schemaFetcher");
const { runAnalystAgent } = require("../services/chatAgent");

// POST /api/chat
async function handleChat(req, res) {
  const userId = req.user.id;
  const { connectionId, message, conversationId, history } = req.body;

  if (!connectionId || !message) {
    return res.status(400).json({ error: "connectionId and message are required" });
  }

  // Verify connection belongs to user
  const connRow = await appDb.query(
    "SELECT * FROM db_connections WHERE id = $1 AND user_id = $2",
    [connectionId, userId]
  );
  if (!connRow.rows[0]) {
    return res.status(404).json({ error: "Database connection not found" });
  }

  let targetPool;
  try {
    targetPool = await getTargetPool(connRow.rows[0]);
    const schemaText = await getSchema(targetPool);

    // Build conversation context from history
    const historyContext = (history || [])
      .slice(-10)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // ── Run AI Agent Logic ──────────────────────────────
    const { answer, steps } = await runAnalystAgent(message, historyContext, schemaText, targetPool);
    await targetPool.end();

    // ── Step 4: Persist to database ──────────────────────────────
    let convId = conversationId;

    if (!convId) {
      // Create new conversation
      const convResult = await appDb.query(
        `INSERT INTO conversations (user_id, connection_id, title) VALUES ($1, $2, $3) RETURNING id`,
        [userId, connectionId, message.substring(0, 100)]
      );
      convId = convResult.rows[0].id;
    }

    // Save user message
    await appDb.query(
      `INSERT INTO chat_messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
      [convId, "user", message]
    );

    // Save assistant message with steps
    await appDb.query(
      `INSERT INTO chat_messages (conversation_id, role, content, steps) VALUES ($1, $2, $3, $4)`,
      [convId, "assistant", answer, JSON.stringify(steps)]
    );

    res.json({ answer, steps, conversationId: convId });
  } catch (err) {
    if (targetPool) await targetPool.end().catch(() => {});
    console.error("[Chat Error]", err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/chat/conversations — list user's conversations
async function listConversations(req, res) {
  const userId = req.user.id;
  const result = await appDb.query(
    `SELECT c.id, c.title, c.connection_id, c.created_at,
            (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as message_count
     FROM conversations c
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC
     LIMIT 50`,
    [userId]
  );
  res.json({ conversations: result.rows });
}

// GET /api/chat/:conversationId/messages — get messages for a conversation
async function getMessages(req, res) {
  const userId = req.user.id;
  const { conversationId } = req.params;

  // Verify ownership
  const conv = await appDb.query(
    "SELECT id FROM conversations WHERE id = $1 AND user_id = $2",
    [conversationId, userId]
  );
  if (!conv.rows[0]) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const messages = await appDb.query(
    `SELECT role, content, steps, created_at FROM chat_messages
     WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId]
  );
  res.json({ messages: messages.rows });
}

module.exports = { handleChat, listConversations, getMessages };
