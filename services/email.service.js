const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Notify admin when a leave request is made
async function notifyAdminOfLeave({ name, email, reason, from_date, to_date }) {
  const message = `
    Leave Request from: ${name} (${email})
    From: ${from_date}
    To: ${to_date}
    Reason: ${reason}
  `;

  return transporter.sendMail({
    from: `"PBO GLOBAL" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Leave Request from ${name}`,
    text: message,
  });
}

// Notify employee when their request is approved/rejected
async function notifyUserOfDecision({ name, email, status }) {
  const message = `Hello ${name}, your leave request has been ${status}.`;

  return transporter.sendMail({
    from: `"PBO GLOBAL" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Leave Request was ${status}`,
    text: message,
  });
}

module.exports = {
  notifyAdminOfLeave,
  notifyUserOfDecision,
};
