const express = require("express");
const router = express.Router();
const sendPaymentConfirmationEmail = require("../utils/sendPaymentConfirmationEmail");

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

    // Validate required fields
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

    // Call sendPaymentConfirmationEmail with email and invoiceData object
    await sendPaymentConfirmationEmail(email, {
      invoiceId: bookingId,
      customerName,
      customerEmail: email,
      customerPhone,
      productName,
      quantity,
      unitPrice,
      totalAmount,
    });

    res.status(200).json({ message: "✅ Confirmation email sent successfully" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ message: "❌ Failed to send confirmation email", error });
  }
});

module.exports = router;
