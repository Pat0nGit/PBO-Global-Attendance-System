const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/authMiddleware");
const LogsController = require("./logs.controller");
const { exportLogsToCSV } = require("../../services/logs.export.service");

// Employee: Export own logs
router.get("/export/user", auth.verifyToken, async (req, res) => {
  try {
    const filePath = await exportLogsToCSV({ userId: req.user.id });
    res.download(filePath, "my_logs.csv");
  } catch (err) {
    console.error(" User export error:", err);
    res.status(500).json({ error: "Failed to export your logs." });
  }
});

// Admin: Export logs with filters (from, to, name)
router.get("/export", auth.verifyToken, auth.isAdmin, async (req, res) => {
  try {
    const { from, to, name } = req.query;
    const filePath = await exportLogsToCSV({ from, to, name });
    res.download(filePath, "logs.csv");
  } catch (err) {
    console.error(" Admin export error:", err);
    res.status(500).json({ error: "Failed to export logs." });
  }
});

// ---  Log endpoints ---
router.get("/all", auth.verifyToken, auth.isAdmin, LogsController.getAllLogs);
router.get("/user", auth.verifyToken, LogsController.getUserLogs);
router.post("/time-in", auth.verifyToken, LogsController.timeIn);
router.post("/time-out", auth.verifyToken, LogsController.timeOut);

module.exports = router;
