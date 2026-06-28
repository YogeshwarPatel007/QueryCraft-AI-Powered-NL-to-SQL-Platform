const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getHistory, deleteHistoryItem } = require("../controllers/historyController");

router.use(authMiddleware);

router.get("/", getHistory);
router.delete("/:id", deleteHistoryItem);

module.exports = router;
