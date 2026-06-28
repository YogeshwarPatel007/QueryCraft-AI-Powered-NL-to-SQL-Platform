// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const databaseRoutes = require("./routes/database.routes");
const queryRoutes = require("./routes/query.routes");
const historyRoutes = require("./routes/history.routes");
const chatRoutes = require("./routes/chat.routes");
const alertRoutes = require("./routes/alert.routes");
const { checkAndRunAlerts } = require("./services/alertDetectionService");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.json({ status: "QueryMind backend running" }));

app.use("/api/auth", authRoutes);
app.use("/api/databases", databaseRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/alerts", alertRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Run global proactive alert checks every 5 minutes in the background
  setInterval(() => {
    checkAndRunAlerts().catch(console.error);
  }, 5 * 60 * 1000);
});
