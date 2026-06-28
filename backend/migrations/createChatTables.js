// migrations/createChatTables.js
// Run once: node migrations/createChatTables.js
// Creates the conversations and chat_messages tables in the app database.

const appDb = require("../config/appDb");

async function migrate() {
  console.log("Creating chat tables...");

  await appDb.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      connection_id INTEGER NOT NULL REFERENCES db_connections(id) ON DELETE CASCADE,
      title TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await appDb.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      steps JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await appDb.query(`
    CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
  `);

  await appDb.query(`
    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
  `);

  console.log("✅ Chat tables created successfully.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
