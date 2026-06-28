// routes/alert.routes.js
const express = require("express");
const { triggerCheck, listAlerts, markRead } = require("../controllers/alertController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/check", triggerCheck);
router.get("/", listAlerts);
router.patch("/:id/read", markRead);

module.exports = router;
