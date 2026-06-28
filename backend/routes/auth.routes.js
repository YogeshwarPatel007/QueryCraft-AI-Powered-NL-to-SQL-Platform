const express = require("express");
const router = express.Router();
const { signup, login, logout, me, updateProfile, updatePassword } = require("../controllers/authController");
const { startGoogleAuth, handleGoogleCallback } = require("../controllers/googleAuthController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateProfile);
router.put("/me/password", authMiddleware, updatePassword);

// Google OAuth
router.get("/google", startGoogleAuth);
router.get("/google/callback", handleGoogleCallback);

module.exports = router;