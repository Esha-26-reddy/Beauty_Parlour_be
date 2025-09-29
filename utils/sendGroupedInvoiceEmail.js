const nodemailer = require("nodemailer");
const generateGroupedInvoicePDFBuffer = require("./generateGroupedInvoicePDFBuffer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // app password or OAuth2 token
  },
});

// Verify transporter configuration once at startup (optional but recommended)
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Nodemailer transporter verification failed:", error);
  } else {
    console.log("✅ Nodemailer transporter is ready");
  }
});

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
    // Generate PDF buffer
    const pdfBuffer = await generateGroupedInvoicePDFBuffer({
      invoiceId,
      customerName,
      customerEmail,
      customerPhone,
      products,
      totalAmount,
    });

    const mailOptions = {
      from: `"Rohini Beauty Parlour" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `🧾 Invoice & Confirmation - Rohini Beauty Parlour [ID: ${invoiceId}]`,
      text: `Dear ${customerName},

Thank you for your purchase of ₹${totalAmount}.
Please find your invoice attached.

Feel free to visit our store to collect your items or reach out with any queries.

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
          filename: `Invoice_${invoiceId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Grouped invoice email sent successfully.");
  } catch (err) {
    console.error("❌ Error sending grouped invoice email:", err);
    throw err; // Propagate error to caller
  }
}

module.exports = sendGroupedInvoiceEmail;
