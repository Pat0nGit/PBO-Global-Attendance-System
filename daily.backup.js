// daily.backup.js
require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { format } = require("date-fns");

const db = new sqlite3.Database(path.join(__dirname, "data.sqlite"));

async function exportLogsToCSVAndSendEmail() {
  return new Promise((resolve, reject) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const filename = `backup_${today}.csv`;
    const filepath = path.join(__dirname, filename);

    const query = `
      SELECT logs.id, users.employee_id, users.name, users.role, logs.date, logs.time_in, logs.time_out, logs.hours
      FROM logs
      JOIN users ON users.id = logs.user_id
      WHERE logs.date = ?
    `;

    db.all(query, [today], async (err, rows) => {
      if (err) {
        console.error("DB error:", err);
        return reject(err);
      }

      if (rows.length === 0) {
        console.log("No logs for today.");
        return resolve("No logs for today.");
      }

      // Convert rows to CSV
      const header = Object.keys(rows[0]).join(",") + "\n";
      const data = rows.map((row) => Object.values(row).join(",")).join("\n");
      const csv = header + data;

      fs.writeFileSync(filepath, csv);

      // Send via email
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      try {
        await transporter.sendMail({
          from: `"PBO GLOBAL" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `Daily Logs Backup – ${today}`,
          text: "Attached is the CSV backup for today's logs.",
          attachments: [
            {
              filename,
              path: filepath,
            },
          ],
        });

        //  Delete file after successful send
        fs.unlinkSync(filepath);

        resolve(
          `Logs exported to ${filename} and email sent to ${process.env.ADMIN_EMAIL}`
        );
      } catch (emailErr) {
        reject(emailErr);
      }
    });
  });
}

exportLogsToCSVAndSendEmail().then(console.log).catch(console.error);
