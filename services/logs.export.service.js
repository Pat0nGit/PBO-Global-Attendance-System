const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");

/**
 * @param {Object} filters
 */
function exportLogsToCSV(filters = {}) {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT u.name, u.role, u.employee_id, l.date, l.time_in, l.time_out, l.hours
      FROM logs l
      JOIN users u ON u.id = l.user_id
      WHERE 1 = 1
    `;

    const params = [];

    if (filters.userId) {
      sql += " AND u.id = ?";
      params.push(filters.userId);
    }

    if (filters.name) {
      sql += " AND (u.name LIKE ? OR u.employee_id LIKE ?)";
      params.push(`%${filters.name}%`, `%${filters.name}%`);
    }

    if (filters.from) {
      sql += " AND l.date >= ?";
      params.push(filters.from);
    }

    if (filters.to) {
      sql += " AND l.date <= ?";
      params.push(filters.to);
    }

    sql += " ORDER BY l.date DESC";

    db.all(sql, params, async (err, rows) => {
      if (err) {
        console.error("Database error while exporting logs:", err);
        return reject(err);
      }

      const exportDir = path.join(__dirname, "../exports");
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir);
      }

      const filePath = path.join(
        exportDir,
        filters.userId ? `logs_user_${filters.userId}.csv` : "logs.csv"
      );

      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: "name", title: "Name" },
          { id: "role", title: "Role" },
          { id: "employee_id", title: "Employee ID" },
          { id: "date", title: "Date" },
          { id: "time_in", title: "Time In" },
          { id: "time_out", title: "Time Out" },
          { id: "hours", title: "Hours" },
        ],
      });

      try {
        await csvWriter.writeRecords(rows);
        resolve(filePath);
      } catch (writeErr) {
        console.error("CSV write failed:", writeErr);
        reject(writeErr);
      }
    });
  });
}

module.exports = {
  exportLogsToCSV,
};
