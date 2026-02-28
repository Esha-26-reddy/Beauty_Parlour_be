const sgMail = require("@sendgrid/mail");
const generateGroupedInvoicePDFBuffer = require("./generateGroupedInvoicePDFBuffer");
require("dotenv").config();

// ✅ Check environment variables
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY not defined in .env");
  process.exit(1);
}

if (!process.env.EMAIL_USER) {
  console.error("❌ EMAIL_USER not defined in .env");
  process.exit(1);
}

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log("📧 SendGrid mailer initialized with:", process.env.EMAIL_USER);

async function sendGroupedInvoiceEmail({
  recipientEmail,
  invoiceId,
  customerName,
  customerEmail,
  customerPhone,
  products,
  totalAmount,
}) {
  try {
    // ✅ Generate PDF buffer
    const pdfBuffer = await generateGroupedInvoicePDFBuffer({
      invoiceId,
      customerName,
      customerEmail,
      customerPhone,
      products,
      totalAmount,
    });

    const msg = {
      to: recipientEmail,
      from: {
        email: process.env.EMAIL_USER, // must be verified in SendGrid
        name: "Rohini Beauty Parlour",
      },
      subject: `🧾 Invoice & Confirmation - Rohini Beauty Parlour [ID: ${invoiceId}]`,
      text: `Dear ${customerName},

Thank you for your purchase of ₹${totalAmount}.
Please find your invoice attached.

If you have any questions, feel free to contact us.

Best regards,
Rohini Beauty Parlour
`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #d63384;">Thank You for Your Purchase, ${customerName}!</h2>
          <p>We're happy to confirm that we received your payment of <strong>₹${totalAmount}</strong>.</p>
          <p><strong>Invoice ID:</strong> ${invoiceId}<br/>
             <strong>Email:</strong> ${customerEmail}<br/>
             <strong>Phone:</strong> ${customerPhone}</p>
          <p>You can collect your items from Rohini Beauty Parlour at your convenience.</p>
          <p style="margin-top: 20px;">If you have any questions, feel free to reply to this email.</p>
          <p style="color: #555;">Warm regards,<br><strong>Rohini Beauty Parlour</strong></p>
        </div>
      `,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: `Invoice_${invoiceId}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
    console.log("✅ Grouped invoice email sent successfully.");
  } catch (err) {
    console.error(
      "❌ Error sending grouped invoice email:",
      err.response?.body || err.message
    );
    throw err;
  }
}

module.exports = sendGroupedInvoiceEmail;
