// generateInvoicePDF.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates a professional invoice PDF and saves it as "invoice.pdf"
 * 
 * @param {Object} invoiceData
 * @param {string} invoiceData.invoiceId - Unique invoice or payment ID
 * @param {string} invoiceData.customerName - Customer's full name
 * @param {string} invoiceData.customerEmail - Customer's email
 * @param {string} invoiceData.customerPhone - Customer's phone number
 * @param {string} invoiceData.productName - Name of the product/service
 * @param {number} invoiceData.quantity - Quantity purchased
 * @param {number} invoiceData.unitPrice - Price per unit (in ₹)
 * @param {number} invoiceData.totalAmount - Total amount (in ₹)
 */
export function generateInvoicePDF({
  invoiceId,
  customerName,
  customerEmail,
  customerPhone,
  productName,
  quantity,
  unitPrice,
  totalAmount,
}) {
  const doc = new jsPDF();

  const date = new Date().toLocaleString();

  // Title
  doc.setFontSize(18);
  doc.text("Rohini Beauty Parlour - Invoice", 20, 20);

  // Invoice details
  doc.setFontSize(12);
  doc.text(`Invoice ID: ${invoiceId}`, 20, 30);
  doc.text(`Date: ${date}`, 20, 38);
  doc.text(`Customer Name: ${customerName}`, 20, 46);
  doc.text(`Email: ${customerEmail}`, 20, 54);
  doc.text(`Phone: ${customerPhone}`, 20, 62);

  // Table with purchased items
  autoTable(doc, {
    startY: 70,
    head: [["Product", "Quantity", "Unit Price (₹)", "Total (₹)"]],
    body: [[productName, quantity, unitPrice.toFixed(2), totalAmount.toFixed(2)]],
  });

  // Footer text (signature)
  const finalY = doc.lastAutoTable?.finalY || 90;
  doc.text("Signed by Rohini Beauty Parlour", 20, finalY + 20);

  // Save PDF
  doc.save("invoice.pdf");
}
