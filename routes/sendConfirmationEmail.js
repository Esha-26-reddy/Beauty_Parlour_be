const express = require("express");
const router = express.Router();
const sendGroupedInvoiceEmail = require("../utils/sendGroupedInvoiceEmail");

router.post("/send-confirmation-email", async (req, res) => {
  try {
    let {
      email,
      bookingId,
      productName,
      customerName,
      customerPhone,
      quantity,
      unitPrice,
      totalAmount,
    } = req.body;

    // Convert numeric values safely
    quantity = Number(quantity);
    unitPrice = Number(unitPrice);
    totalAmount = Number(totalAmount);

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

    // 🔥 Try sending email but don't crash API if it fails
    try {
      await sendGroupedInvoiceEmail({
        recipientEmail: email.toLowerCase(),
        invoiceId: bookingId,
        customerName,
        customerEmail: email.toLowerCase(),
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

      console.log("✅ Confirmation email sent");
    } catch (emailError) {
      console.error(
        "⚠ Email failed but request processed:",
        emailError.message
      );
    }

    res.status(200).json({
      message: "Confirmation request processed successfully",
    });
  } catch (error) {
    console.error("❌ Error in confirmation route:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
