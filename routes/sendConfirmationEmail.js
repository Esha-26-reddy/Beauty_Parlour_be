const express = require("express");
const router = express.Router();
const sendGroupedInvoiceEmail = require("../utils/sendGroupedInvoiceEmail");

router.post("/send-confirmation-email", async (req, res) => {
  try {
    const {
      email,
      bookingId,
      productName,
      customerName,
      customerPhone,
      quantity,
      unitPrice,
      totalAmount,
    } = req.body;

    if (
      !email ||
      !bookingId ||
      !productName ||
      !customerName ||
      !customerPhone ||
      !quantity ||
      !unitPrice ||
      !totalAmount
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await sendGroupedInvoiceEmail({
      recipientEmail: email,
      invoiceId: bookingId,
      customerName,
      customerEmail: email,
      customerPhone,
      products: [
        {
          productName,
          quantity,
          unitPrice,
          totalPrice: totalAmount,
        },
      ],
      totalAmount,
    });

    res.status(200).json({
      message: "✅ Confirmation email sent successfully",
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({
      message: "Failed to send confirmation email",
      error: error.message,
    });
  }
});

module.exports = router;