require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(path.join(__dirname, "data.sqlite")); // Adjust if path is different

const today = new Date().toISOString().split("T")[0];
const filename = path.join(__dirname, `logs-${today}.csv`);

function exportLogsToCSV(callback) {
  const stream = fs.createWriteStream(filename);
  stream.write("Name,Employee ID,Role,Date,Time In,Time Out,Hours\n");

  db.all(
    `SELECT u.name, u.employee_id, u.role, l.date, l.time_in, l.time_out, l.hours
   FROM logs l
   JOIN users u ON u.id = l.user_id
   WHERE l.date = ?`,
    [today],
    (err, rows) => {
      if (err) {
        console.error("DB error:", err);
        return;
      }

      rows.forEach((row) => {
        const line = `${row.name},${row.employee_id},${row.role},${row.date},${
          row.time_in || ""
        },${row.time_out || ""},${row.hours || ""}\n`;
        stream.write(line);
      });

      stream.end(() => {
        console.log(" CSV created:", filename);
        callback();
      });
    }
  );
}

function sendEmail() {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `Daily Logs Backup - ${today}`,
    text: `Attached is the log backup for ${today}.`,
    attachments: [
      {
        filename: `logs-${today}.csv`,
        path: filename,
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(" Email error:", err);
    } else {
      console.log(" Backup email sent:", info.response);
    }
  });
}

exportLogsToCSV(sendEmail);
