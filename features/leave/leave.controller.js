const LeaveService = require("./leave.service");
const {
  notifyAdminOfLeave,
  notifyUserOfDecision,
} = require("../../services/email.service");
const db = require("../../config/db");

const LeaveController = {
  requestLeave: async (req, res) => {
    const { reason, from_date, to_date } = req.body;
    const userId = req.user.id;

    try {
      await LeaveService.requestLeave(userId, reason, from_date, to_date);

      db.get(
        "SELECT name, email FROM users WHERE id = ?",
        [userId],
        async (err, user) => {
          if (!err && user) {
            try {
              await notifyAdminOfLeave({
                name: user.name,
                email: user.email,
                reason,
                from_date,
                to_date,
              });
              console.log(` Admin notified of leave from ${user.name}`);
            } catch (mailErr) {
              console.error(" Failed to notify admin:", mailErr);
            }
          }
        }
      );

      res.status(201).json({ message: "Leave request submitted." });
    } catch (err) {
      console.error(" Leave request failed:", err);
      res.status(500).json({
        error: err.message || "Failed to submit leave request.",
      });
    }
  },

  getMyLeaves: async (req, res) => {
    try {
      const leaves = await LeaveService.getUserLeaves(req.user.id);
      res.json(leaves);
    } catch (err) {
      console.error(" Fetch my leaves failed:", err);
      res.status(500).json({ error: "Failed to fetch leave requests." });
    }
  },

  getAllLeaves: async (_req, res) => {
    try {
      const leaves = await LeaveService.getAllLeaves();
      res.json(leaves);
    } catch (err) {
      console.error(" Fetch all leaves failed:", err);
      res.status(500).json({ error: "Failed to fetch leave requests." });
    }
  },

  updateLeaveStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }

    try {
      await LeaveService.updateLeaveStatus(id, status);

      db.get(
        `SELECT u.name, u.email FROM leave_requests lr
         JOIN users u ON u.id = lr.user_id WHERE lr.id = ?`,
        [id],
        async (err, user) => {
          if (!err && user) {
            try {
              await notifyUserOfDecision({
                name: user.name,
                email: user.email,
                status,
              });
              console.log(` Notified ${user.name} of leave ${status}`);
            } catch (mailErr) {
              console.error(` Failed to notify user (${status}):`, mailErr);
            }
          }
        }
      );

      res.json({ message: `Leave ${status}` });
    } catch (err) {
      console.error(` ${status} leave failed:`, err);
      res.status(500).json({ error: `Failed to ${status} leave.` });
    }
  },

  getLeaveById: async (req, res) => {
    const { id } = req.params;

    try {
      const leave = await new Promise((resolve, reject) => {
        db.get(
          `SELECT lr.*, u.name FROM leave_requests lr
           JOIN users u ON u.id = lr.user_id
           WHERE lr.id = ?`,
          [id],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      });

      if (!leave) {
        return res.status(404).json({ error: "Leave not found" });
      }

      res.json(leave);
    } catch (err) {
      console.error(" Error fetching leave by ID:", err);
      res.status(500).json({ error: "Failed to fetch leave details." });
    }
  },
};

module.exports = {
  requestLeave: LeaveController.requestLeave,
  getMyLeaves: LeaveController.getMyLeaves,
  getAllLeaves: LeaveController.getAllLeaves,
  updateLeaveStatus: LeaveController.updateLeaveStatus,
  getLeaveById: LeaveController.getLeaveById,
};
