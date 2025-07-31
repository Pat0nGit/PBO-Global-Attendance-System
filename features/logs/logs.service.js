const {
  createLog,
  updateLogWithTimeOut,
  getLogByDate,
  getLogsByUser,
  getAllLogs,
} = require("./logs.model");

const db = require("../../config/db");
const { formatDate, computeHours } = require("../../utils/date");

// Block time-in if already recorded OR on leave
const timeIn = async (userId) => {
  const date = formatDate(new Date());
  const timeIn = new Date().toTimeString().slice(0, 8);

  const log = await getLogByDate(userId, date);
  if (log?.time_in) {
    throw new Error("Time in already recorded for today.");
  }

  const onLeave = await hasApprovedLeave(userId, date);
  if (onLeave) {
    throw new Error("You are on approved leave today.");
  }

  return await createLog(userId, date, timeIn);
};

// Block time-out if no time-in, or already timed out OR on leave
const timeOut = async (userId) => {
  const date = formatDate(new Date());
  const timeOut = new Date().toTimeString().slice(0, 8);

  const log = await getLogByDate(userId, date);
  if (!log?.time_in) {
    throw new Error("No time in found for today.");
  }
  if (log?.time_out) {
    throw new Error("Time out already recorded for today.");
  }

  const onLeave = await hasApprovedLeave(userId, date);
  if (onLeave) {
    throw new Error("You are on approved leave today.");
  }

  // Auto-deduct 1 hour for lunch
  let hours = computeHours(log.time_in, timeOut);
  hours = Math.max(hours - 1, 0); // Deduct 1 hour lunch

  return await updateLogWithTimeOut(userId, date, timeOut, hours);
};

const getLogsByUserService = async (userId) => {
  return await getLogsByUser(userId);
};

const getAllLogsService = async (filters) => {
  return await getAllLogs(filters);
};

// Utility: Check if today is within approved leave range
const hasApprovedLeave = (userId, date) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM leave_requests
      WHERE user_id = ?
        AND status = 'approved'
        AND date(?) BETWEEN from_date AND IFNULL(to_date, from_date)
    `;
    db.get(sql, [userId, date], (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
};

module.exports = {
  timeIn,
  timeOut,
  getLogsByUser: getLogsByUserService,
  getAllLogs: getAllLogsService,
};
