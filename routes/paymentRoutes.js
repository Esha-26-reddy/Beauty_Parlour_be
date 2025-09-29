const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const router = express.Router();

// 🔐 Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ==============================
// ✅ Single Product Payment
// ==============================
router.post("/", async (req, res) => {
  const { amount, name } = req.body;

  console.log("📦 Single Product Payment Request:", req.body);

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount." });
  }

  if (!name || typeof name !== "string") {
    return res.status(400).json({ success: false, message: "Invalid product name." });
  }

  try {
    const amountInPaise = Math.round(amount * 100); // ✅ convert ₹ to paise

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // ✅ auto capture
    });

    console.log("✅ Razorpay single product order created:", order.id);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Razorpay single product order creation failed:", error);
    res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
});

// ==============================
// ✅ Cart Payment
// ==============================
router.post("/create-order", async (req, res) => {
  const { cartItems } = req.body;

  console.log("🛒 Cart Payment Request:", cartItems);

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty or invalid." });
  }

  try {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    const amountInPaise = Math.round(totalAmount * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({ success: false, message: "Total amount must be greater than 0." });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    console.log("✅ Razorpay cart order created:", order.id);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Razorpay cart order creation failed:", error);
    res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
});

// ==============================
// ✅ Optional: Test Route
// ==============================
router.get("/test", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 100, // ₹1
      currency: "INR",
      receipt: `test_receipt_${Date.now()}`,
      payment_capture: 1,
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
