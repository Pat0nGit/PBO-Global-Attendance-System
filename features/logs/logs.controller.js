const logService = require("./logs.service");

const LogsController = {
  timeIn: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await logService.timeIn(userId);
      res.status(200).json({ message: "Time in recorded", result });
    } catch (err) {
      console.error("Time In Error:", err);
      res
        .status(400)
        .json({ error: err.message || "Failed to record time in." });
    }
  },

  timeOut: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await logService.timeOut(userId);
      res.status(200).json({ message: "Time out recorded", result });
    } catch (err) {
      console.error("Time Out Error:", err);
      res
        .status(400)
        .json({ error: err.message || "Failed to record time out." });
    }
  },

  getUserLogs: async (req, res) => {
    try {
      const logs = await logService.getLogsByUser(req.user.id);
      res.json(logs);
    } catch (err) {
      console.error("Fetch User Logs Error:", err);
      res.status(500).json({ error: "Failed to fetch logs." });
    }
  },

  getAllLogs: async (req, res) => {
    try {
      const { from, to, name } = req.query;
      const logs = await logService.getAllLogs({ from, to, name });
      res.json(logs);
    } catch (err) {
      console.error("Fetch All Logs Error:", err);
      res.status(500).json({ error: "Failed to fetch all logs." });
    }
  },
};

module.exports = LogsController;
