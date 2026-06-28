const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  addConnection,
  listConnections,
  testConnection,
  deleteConnection,
  getTables,
  getTableDetail,
  updateConnectionInterval,
} = require("../controllers/databaseController");

router.use(authMiddleware);

router.post("/", addConnection);
router.get("/", listConnections);
router.post("/test", testConnection);
router.delete("/:id", deleteConnection);
router.patch("/:id/interval", updateConnectionInterval);

// Schema browser
router.get("/:id/tables", getTables);
router.get("/:id/tables/:table", getTableDetail);

module.exports = router;