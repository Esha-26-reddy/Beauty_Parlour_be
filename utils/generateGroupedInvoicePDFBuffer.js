const PDFDocument = require("pdfkit");

function generateGroupedInvoicePDFBuffer({
  invoiceId,
  customerName,
  customerEmail,
  customerPhone,
  products, // array of { productName, quantity, unitPrice, totalPrice }
  totalAmount,
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

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
      reject(err);
    }
  });
}

module.exports = generateGroupedInvoicePDFBuffer;
