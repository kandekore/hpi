import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // or true if port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Mark this function as async to use await inside
export async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: '"Vehicle Data Information" <verify@vehicledatainformation.co.uk>', 
      // or use something like process.env.FROM_EMAIL
      to,
      subject,
      html,
    });
    console.log('Message sent:', info.messageId);
    return info; // optionally return info if needed
  } catch (err) {
    console.error('Error sending mail:', err);
    throw err; // rethrow or handle error as needed
  }
}

// Optional default export (e.g., if you want to import everything at once)
export default { sendMail };
