// config/appDb.js
// This connects to YOUR fixed app database (Neon) — stores users, db_connections, queries.
// This is the ONLY database your backend has a permanent, always-on connection to.
const { Pool } = require("pg");
require("dotenv").config();

const appDb = new Pool({
  connectionString: process.env.APP_DB_URI,
  ssl: { rejectUnauthorized: false }, // required for Neon
});

appDb.on("error", (err) => {
  console.error("Unexpected error on app DB idle client", err);
});

module.exports = appDb;
