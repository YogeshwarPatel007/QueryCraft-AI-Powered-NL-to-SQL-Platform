// services/targetDbConnector.js
// Builds a SHORT-LIVED connection to a user's target database, using the
// read-only credentials they stored. Never the app DB. Never an admin login.

const { Pool } = require("pg");
const { decrypt } = require("../utils/encrypt");

async function getTargetPool(dbConnection) {
  const password = decrypt(dbConnection.encrypted_password);

  return new Pool({
    host: dbConnection.host,
    port: dbConnection.port,
    database: dbConnection.db_name,
    user: dbConnection.username, // should be a readonly_ai_user-style role
    password,
    ssl: dbConnection.ssl_required ? { rejectUnauthorized: false } : false,
    max: 2,
    idleTimeoutMillis: 5000,
  });
}

module.exports = { getTargetPool };
