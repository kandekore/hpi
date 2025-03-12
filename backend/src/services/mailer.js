// services/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // or true if port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: '"Vehicle Data Information" <verify@vehicledatainformation.co.uk>', // or use process.env.FROM_EMAIL
    to,
    subject,
    html,
  });
  console.log('Message sent:', info.messageId);
}

module.exports = { sendMail };
