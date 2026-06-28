// controllers/googleAuthController.js
// Minimal Google OAuth2 flow — no extra session/passport dependency needed.
const appDb = require("../config/appDb");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FRONTEND_URL,
} = process.env;

// GET /api/auth/google — redirect the browser to Google's consent screen
function startGoogleAuth(req, res) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

// GET /api/auth/google/callback — Google redirects back here with a ?code=
async function handleGoogleCallback(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }

  try {
    // 1. Exchange the authorization code for an access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token from Google");
    }

    // 2. Use the access token to fetch the user's Google profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const profile = await profileRes.json();
    const { email, name } = profile;

    if (!email) throw new Error("Google did not return an email address");

    // 3. Find or create the user in our app database
    let result = await appDb.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = result.rows[0];

    if (!user) {
      // Google-authenticated users don't set a password — store a random
      // unusable hash so the NOT NULL constraint on password_hash is satisfied.
      const randomHash = await bcrypt.hash(
        require("crypto").randomBytes(32).toString("hex"),
        10
      );
      const insertResult = await appDb.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name || email.split("@")[0], email, randomHash]
      );
      user = insertResult.rows[0];
    }

    // 4. Issue our own JWT cookie, same as normal login
    const jwtToken = generateToken({ id: user.id, email: user.email });
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Send the browser back to the app, fully logged in
    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
}

module.exports = { startGoogleAuth, handleGoogleCallback };