const db = require("../../config/db");

const LeaveModel = {
  create: (userId, reason, fromDate, toDate, callback) => {
    const sql = `INSERT INTO leave_requests (user_id, reason, from_date, to_date, status)
                 VALUES (?, ?, ?, ?, 'pending')`;
    db.run(sql, [userId, reason, fromDate, toDate], callback);
  },

  checkOverlap: (userId, fromDate, toDate, callback) => {
    const sql = `SELECT * FROM leave_requests 
                 WHERE user_id = ? 
                 AND from_date <= ? 
                 AND to_date >= ?`;
    db.all(sql, [userId, toDate, fromDate], callback);
  },

  findByUser: (userId, callback) => {
    const sql = `SELECT id, reason, from_date, to_date, status 
                 FROM leave_requests 
                 WHERE user_id = ?`;
    db.all(sql, [userId], callback);
  },

  findAll: (callback) => {
    const sql = `
      SELECT lr.id, u.name, lr.from_date, lr.to_date, lr.reason, lr.status
      FROM leave_requests lr
      JOIN users u ON u.id = lr.user_id
    `;
    db.all(sql, [], callback);
  },

  updateStatus: (id, status, callback) => {
    const sql = `UPDATE leave_requests SET status = ? WHERE id = ?`;
    db.run(sql, [status, id], callback);
  },
};

module.exports = LeaveModel;
