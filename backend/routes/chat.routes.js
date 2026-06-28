const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const rateLimiter = require("../middleware/rateLimiter");
const { handleChat, listConversations, getMessages } = require("../controllers/chatController");

router.post("/", authMiddleware, rateLimiter, handleChat);
router.get("/conversations", authMiddleware, listConversations);
router.get("/:conversationId/messages", authMiddleware, getMessages);

module.exports = router;
