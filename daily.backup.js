require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { format } = require("date-fns");

const db = new sqlite3.Database(path.join(__dirname, "data.sqlite"));

function exportLogsToCSVAndSendEmail() {
  return new Promise((resolve, reject) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const filename = `backup-${today}.csv`;
    const filePath = path.join(__dirname, filename);

    const query = `
      SELECT u.employee_id, u.name, u.role, l.date, l.time_in, l.time_out, l.hours
      FROM logs l
      JOIN users u ON l.user_id = u.id
      WHERE l.date = ?
    `;

    db.all(query, [today], (err, rows) => {
      if (err) return reject(err);

      const header = "Employee ID,Name,Role,Date,Time In,Time Out,Hours\n";
      const csvData = rows.map(
        (row) =>
          `${row.employee_id},${row.name},${row.role},${row.date},${row.time_in},${row.time_out},${row.hours}`
      );

      fs.writeFileSync(filePath, header + csvData.join("\n"));

      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Attendance Backup" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `Daily Logs Backup - ${today}`,
        text: "Attached is the daily backup CSV of logs.",
        attachments: [
          {
            filename,
            path: filePath,
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        fs.unlinkSync(filePath); // Clean up file after sending

        if (error) return reject(error);
        resolve(`Backup sent: ${info.response}`);
      });
    });
  });
}

module.exports = { exportLogsToCSVAndSendEmail };
