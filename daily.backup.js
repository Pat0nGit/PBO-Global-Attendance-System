require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(path.join(__dirname, "data.sqlite"));

const today = new Date().toISOString().split("T")[0];
const filename = path.join(__dirname, `logs-${today}.csv`);

function exportLogsToCSV(callback) {
  const stream = fs.createWriteStream(filename);
  stream.write("Name,Employee ID,Role,Date,Time In,Time Out,Hours\n");

  db.all(
    `SELECT name, employee_id, role, date, time_in, time_out, hours 
     FROM logs WHERE date = ?`,
    [today],
    (err, rows) => {
      if (err) {
        console.error("DB error:", err);
        return;
      }

      rows.forEach((row) => {
        const line = `${row.name},${row.employee_id},${row.role},${row.date},${row.time_in},${row.time_out},${row.hours}\n`;
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
    subject: ` Daily Logs Backup ${today}`,
    text: `Backup logs for ${today} attached.`,
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
      console.log("Backup email sent to:", process.env.ADMIN_EMAIL);
      console.log(info.response);
    }
  });
}

// Start backup
exportLogsToCSV(sendEmail);
