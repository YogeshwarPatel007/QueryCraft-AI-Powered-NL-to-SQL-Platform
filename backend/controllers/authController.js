// controllers/authController.js
const bcrypt = require("bcryptjs");
const appDb = require("../config/appDb");
const { generateToken } = require("../utils/jwt");

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existing = await appDb.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await appDb.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await appDb.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = generateToken({ id: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function logout(req, res) {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}

async function me(req, res) {
  const result = await appDb.query("SELECT id, name, email FROM users WHERE id = $1", [req.user.id]);
  res.json({ user: result.rows[0] });
}

// PUT /api/auth/me — update name and/or email
async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (email) {
      const existing = await appDb.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Email already in use by another account" });
      }
    }

    const result = await appDb.query(
      `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email)
       WHERE id = $3 RETURNING id, name, email`,
      [name || null, email || null, userId]
    );

    // Re-issue the JWT since email may be embedded in the token payload
    const updatedUser = result.rows[0];
    const token = generateToken({ id: updatedUser.id, email: updatedUser.email });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/auth/me/password — change password (requires current password)
async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const result = await appDb.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await appDb.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { signup, login, logout, me, updateProfile, updatePassword };