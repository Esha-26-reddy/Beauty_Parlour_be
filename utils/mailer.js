const nodemailer = require('nodemailer');
require('dotenv').config();

// Check if email credentials are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS not defined in .env");
  process.exit(1); // Exit the app if email credentials are missing
}

console.log("📧 Mailer initialized with:", process.env.EMAIL_USER);

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error verifying email transporter:', error);
  } else {
    console.log('✅ Email transporter is ready');
  }
});

module.exports = transporter;
