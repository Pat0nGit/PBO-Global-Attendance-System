const LeaveModel = require("./leave.model");

const requestLeave = (userId, reason, fromDate, toDate) => {
  return new Promise((resolve, reject) => {
    LeaveModel.checkOverlap(userId, fromDate, toDate, (err, rows) => {
      if (err) return reject(err);
      if (rows.length > 0) {
        return reject(new Error("Leave overlaps with an existing request."));
      }

      LeaveModel.create(userId, reason, fromDate, toDate, (err2) => {
        if (err2) return reject(err2);
        resolve();
      });
    });
  });
};

const getUserLeaves = (userId) => {
  return new Promise((resolve, reject) => {
    LeaveModel.findByUser(userId, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const getAllLeaves = () => {
  return new Promise((resolve, reject) => {
    LeaveModel.findAll((err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateLeaveStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    LeaveModel.updateStatus(id, status, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = {
  requestLeave,
  getUserLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
