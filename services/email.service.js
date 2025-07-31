const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function notifyUserOfDecision({ name, email, status }) {
  const subject = `Leave ${status === "approved" ? "Approved" : "Rejected"}`;
  const html = `
    <p>Dear ${name},</p>
    <p>Your leave request has been <strong>${status.toUpperCase()}</strong>.</p>
    <p>Regards,<br>PBO GLOBAL HR</p>
  `;

  return transporter.sendMail({
    from: `"PBO GLOBAL" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
}

function notifyAdminOfLeave({ name, email, reason, from_date, to_date }) {
  const subject = `New Leave Request - ${name}`;
  const html = `
    <p>Employee <strong>${name}</strong> (${email}) submitted a leave request.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p><strong>From:</strong> ${from_date}<br><strong>To:</strong> ${
    to_date || from_date
  }</p>
  `;

  return transporter.sendMail({
    from: `"PBO GLOBAL" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject,
    html,
  });
}

module.exports = { notifyAdminOfLeave, notifyUserOfDecision };
