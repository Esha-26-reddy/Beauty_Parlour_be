const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const router = express.Router();

console.log("🔑 Razorpay Key:", process.env.RAZORPAY_KEY_ID);
console.log("🔐 Razorpay Secret:", process.env.RAZORPAY_KEY_SECRET ? "LOADED" : "MISSING");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==============================
// Single Product Payment
// ==============================
router.post("/", async (req, res) => {
  try {
    const { amount, name } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, message: "Invalid product name" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // ✅ paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==============================
// Cart Payment
// ==============================
router.post("/create-order", async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Razorpay cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==============================
// Test Route
// ==============================
router.get("/test", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 100, // ₹1
      currency: "INR",
      receipt: `test_${Date.now()}`,
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
