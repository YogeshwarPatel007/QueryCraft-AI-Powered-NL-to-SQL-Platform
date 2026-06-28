const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const rateLimiter = require("../middleware/rateLimiter");
const { handleQuery, handleRawQuery, handleExplain } = require("../controllers/queryController");

router.post("/", authMiddleware, rateLimiter, handleQuery);
router.post("/raw", authMiddleware, rateLimiter, handleRawQuery);
router.post("/explain", authMiddleware, rateLimiter, handleExplain);

module.exports = router;