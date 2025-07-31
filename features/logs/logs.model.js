const db = require("../../config/db");

// Create new log with time_in
const createLog = (userId, date, timeIn) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO logs (user_id, date, time_in) VALUES (?, ?, ?)`;
    db.run(sql, [userId, date, timeIn], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

// Update log with time_out and calculated hours
const updateLogWithTimeOut = (userId, date, timeOut, hours) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE logs SET time_out = ?, hours = ? WHERE user_id = ? AND date = ?`;
    db.run(sql, [timeOut, hours, userId, date], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

// Get today's log for a user
const getLogByDate = (userId, date) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM logs WHERE user_id = ? AND date = ?`,
      [userId, date],
      (err, row) => (err ? reject(err) : resolve(row))
    );
  });
};

// Get logs for logged-in user
const getLogsByUser = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM logs WHERE user_id = ? ORDER BY date DESC`;
    db.all(sql, [userId], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

// Get all logs with optional filters
const getAllLogs = ({ from, to, name }) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT l.*, u.name, u.role, u.employee_id 
      FROM logs l
      JOIN users u ON u.id = l.user_id
      WHERE 1=1
    `;
    const params = [];

    if (from) {
      sql += " AND l.date >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND l.date <= ?";
      params.push(to);
    }
    if (name) {
      sql += " AND (u.name LIKE ? OR u.employee_id LIKE ?)";
      const like = `%${name}%`;
      params.push(like, like);
    }

    sql += " ORDER BY l.date DESC";

    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  createLog,
  updateLogWithTimeOut,
  getLogByDate,
  getLogsByUser,
  getAllLogs,
};
