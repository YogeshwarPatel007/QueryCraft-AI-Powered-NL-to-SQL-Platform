-- =========================================================
-- RUN THIS IN YOUR TARGET DATABASE (the one with real business data, e.g. customers/orders)
-- =========================================================

-- Sample tables (replace with your real data, or skip this if you already have tables)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  amount NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO customers (name, email) VALUES
  ('Alice', 'alice@email.com'),
  ('Bob', 'bob@email.com')
ON CONFLICT DO NOTHING;

INSERT INTO orders (customer_id, amount) VALUES
  (1, 500), (1, 700), (2, 300);

-- =========================================================
-- READ-ONLY ROLE — this is the user your backend connects with to RUN queries.
-- It can SELECT only. It cannot INSERT, UPDATE, DELETE, DROP, or ALTER anything.
-- =========================================================

CREATE ROLE readonly_ai_user WITH LOGIN PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT CONNECT ON DATABASE neondb TO readonly_ai_user;
GRANT USAGE ON SCHEMA public TO readonly_ai_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_ai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_ai_user;
