const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate PDF buffer in-memory
function generateGroupedInvoicePDFBuffer({
  invoiceId,
  customerName,
  customerEmail,
  customerPhone,
  products,
  totalAmount,
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(20).text("Rohini Beauty Parlour - Invoice", { align: "center" });
      doc.moveDown().fontSize(12);
      doc.text(`Invoice ID: ${invoiceId}`);
      doc.text(`Date: ${new Date().toLocaleString()}`);
      doc.moveDown();
      doc.text(`Customer Name: ${customerName}`);
      doc.text(`Email: ${customerEmail}`);
      doc.text(`Phone: ${customerPhone}`);
      doc.moveDown();

      // Table headers
      const tableTop = doc.y;
      const itemX = 50, qtyX = 300, priceX = 370, totalX = 450;

      doc.font("Helvetica-Bold")
        .text("Product", itemX, tableTop)
        .text("Quantity", qtyX, tableTop)
        .text("Unit Price", priceX, tableTop)
        .text("Total", totalX, tableTop);

      // Table rows
      let rowY = tableTop + 20;
      doc.font("Helvetica");
      products.forEach(({ productName, quantity, unitPrice, totalPrice }) => {
        doc.text(productName, itemX, rowY)
          .text(quantity, qtyX, rowY)
          .text(`₹${unitPrice.toFixed(2)}`, priceX, rowY)
          .text(`₹${totalPrice.toFixed(2)}`, totalX, rowY);
        rowY += 20;
      });

      doc.moveDown(2);
      doc.font("Helvetica-Bold").text(`Total Amount: ₹${totalAmount.toFixed(2)}`, { align: "right" });
      doc.moveDown(4).fontSize(10).text("Signed by Rohini Beauty Parlour", { align: "center" });

      doc.end();
    } catch (err) {
      console.error("❌ PDF generation failed:", err);
      reject(err);
    }
  });
}

// Main function to send confirmation email
async function sendPaymentConfirmationEmail(toEmail, invoiceData) {
  try {
    if (!invoiceData || !invoiceData.products || invoiceData.products.length === 0) {
      throw new Error("Invoice data is incomplete or empty");
    }

    const products = invoiceData.products.map((p) => ({
      productName: p.productName,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      totalPrice: p.unitPrice * p.quantity,
    }));

    const totalAmount = products.reduce((acc, p) => acc + p.totalPrice, 0);

    const pdfBuffer = await generateGroupedInvoicePDFBuffer({
      invoiceId: invoiceData.invoiceId,
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerPhone: invoiceData.customerPhone,
      products,
      totalAmount,
    });

    const mailOptions = {
      from: `"Rohini Beauty Parlour" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Payment Confirmation & Invoice from Rohini Beauty Parlour",
      html: `
        <p>Dear ${invoiceData.customerName},</p>
        <p>Thank you for your purchase! Your booking has been confirmed.</p>
        <p><strong>Booking ID:</strong> ${invoiceData.invoiceId}</p>
        <p>Please find your invoice attached.<br/>
        <b>Note:</b> Show this invoice to collect your product(s).</p>
        <p>Regards,<br/>Rohini Beauty Parlour</p>
      `,
      attachments: [
        {
          filename: `invoice_${invoiceData.invoiceId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
  }
}

module.exports = sendPaymentConfirmationEmail;
