require("dotenv").config({ path: "../.env" });
const { Pool } = require("pg");
const { encrypt } = require("../utils/encrypt");

const pool = new Pool({
  connectionString: process.env.APP_DB_URI,
});

async function getEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
    }),
  });
  const data = await response.json();
  if (!data.embedding?.values) {
    throw new Error("Failed to get embedding: " + JSON.stringify(data));
  }
  return data.embedding.values;
}

const DUMMY_PRODUCTS = [
  { name: "Arctic Explorer Parka", desc: "Heavy-duty winter jacket, extremely warm, fur hood, perfect for freezing temperatures and snow." },
  { name: "Urban Comfort Sneakers", desc: "Lightweight, breathable shoes for city walking, stylish white and grey." },
  { name: "Pro-Gamer Mechanical Keyboard", desc: "RGB backlit, tactile clicky switches, ultra-fast response time for competitive gaming." },
  { name: "Zenith Coffee Maker", desc: "Brews perfect espresso and drip coffee, built-in grinder, sleek stainless steel design." },
  { name: "Nomad Travel Backpack", desc: "Water-resistant, multiple compartments, laptop sleeve, great for hiking and commuting." },
  { name: "Sunset Yoga Mat", desc: "Eco-friendly, non-slip texture, 6mm thickness for comfortable joint support." },
  { name: "Lumina Desk Lamp", desc: "Adjustable brightness, eye-care LED, wireless charging pad base." },
  { name: "Chef's Master Knife", desc: "High-carbon Japanese steel, razor-sharp edge, ergonomic wooden handle." },
  { name: "Acoustic Noise-Canceling Headphones", desc: "Over-ear, 30-hour battery life, immersive sound quality, deep bass." },
  { name: "Breeze Standing Fan", desc: "Quiet oscillation, 12 speeds, remote control, perfect for summer cooling." },
];

async function run() {
  try {
    console.log("Creating vector extension...");
    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

    console.log("Creating products_sandbox table...");
    await pool.query(`
      DROP TABLE IF EXISTS products_sandbox;
      CREATE TABLE products_sandbox (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        embedding vector(3072) -- Gemini embeddings are 3072-dimensional
      );
    `);

    console.log("Generating embeddings and inserting products...");
    for (const product of DUMMY_PRODUCTS) {
      console.log(`Embedding: ${product.name}`);
      const vector = await getEmbedding(product.name + " - " + product.desc);
      
      await pool.query(
        `INSERT INTO products_sandbox (name, description, embedding) VALUES ($1, $2, $3)`,
        [product.name, product.desc, JSON.stringify(vector)]
      );
    }

    console.log("Adding sandbox connection to user account 1 (if exists)...");
    // Get first user
    const userResult = await pool.query(`SELECT id FROM users LIMIT 1`);
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      // Check if already added
      const connCheck = await pool.query(`SELECT id FROM db_connections WHERE connection_name = 'Semantic Search Demo DB'`);
      if (connCheck.rows.length === 0) {
        const appUri = new URL(process.env.APP_DB_URI);
        const username = appUri.username;
        const password = appUri.password;
        const host = appUri.hostname;
        const port = appUri.port || 5432;
        const dbName = appUri.pathname.substring(1);
        const encryptedPassword = encrypt(password);

        await pool.query(
          `INSERT INTO db_connections (user_id, connection_name, host, port, db_name, username, encrypted_password, ssl_required)
           VALUES ($1, 'Semantic Search Demo DB', $2, $3, $4, $5, $6, true)`,
          [userId, host, port, dbName, username, encryptedPassword]
        );
        console.log("Added 'Semantic Search Demo DB' to your connections!");
      }
    }

    console.log("✅ Sandbox setup complete!");
  } catch (e) {
    console.error("Error setting up sandbox:", e);
  } finally {
    await pool.end();
  }
}

run();
