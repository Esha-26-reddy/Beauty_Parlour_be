const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// ✅ Check if SendGrid API key exists
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY not defined in .env");
  process.exit(1);
}

if (!process.env.EMAIL_USER) {
  console.error("❌ EMAIL_USER not defined in .env");
  process.exit(1);
}

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log("📧 SendGrid mailer initialized with sender:", process.env.EMAIL_USER);

// ✅ Export sendMail function (similar to nodemailer)
const sendMail = async (mailOptions) => {
  try {
    const msg = {
      to: mailOptions.to,
      from: process.env.EMAIL_USER, // must be verified in SendGrid
      subject: mailOptions.subject,
      html: mailOptions.html,
      attachments: mailOptions.attachments || [],
    };

    const response = await sgMail.send(msg);
    console.log("✅ Email sent successfully:", response[0].statusCode);
  } catch (error) {
    console.error("❌ SendGrid email error:", error.response?.body || error.message);
  }
};

module.exports = { sendMail };
