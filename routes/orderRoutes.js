const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const sendGroupedInvoiceEmail = require("../utils/sendGroupedInvoiceEmail");
const crypto = require("crypto");

// ========================
// 🔐 Razorpay Signature Verification
// ========================
const verifyPayment = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  console.log("🔎 Expected Signature:", expectedSignature);
  console.log("🔎 Received Signature:", signature);

  return expectedSignature === signature;
};

// ========================
// ✅ Single Product Order
// ========================
router.post("/create", async (req, res) => {
  console.log("🔥 /create route hit");
  console.log("📦 BODY RECEIVED:", req.body);

  try {
    let {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      productName,
      quantity,
      amount,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    quantity = Number(quantity);
    amount = Number(amount);

    if (
      razorpay_payment_id == null ||
      razorpay_order_id == null ||
      razorpay_signature == null ||
      !productId ||
      !productName ||
      isNaN(quantity) ||
      isNaN(amount) ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const unitPrice = amount / quantity;

    const newOrder = new Order({
      products: [
        {
          productId,
          productName,
          quantity,
          unitPrice,
          totalPrice: amount,
        },
      ],
      amount,
      paymentId: razorpay_payment_id,
      customerName,
      customerEmail: customerEmail.toLowerCase(), // ✅ FIXED
      customerPhone,
      source: "single",
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Order saved in DB");

    await sendGroupedInvoiceEmail({
      recipientEmail: customerEmail.toLowerCase(),
      invoiceId: razorpay_payment_id,
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      customerPhone,
      products: [
        {
          productName,
          quantity,
          unitPrice,
          totalPrice: amount,
        },
      ],
      totalAmount: amount,
    });

    console.log("✅ Email sent for single product order.");

    res.status(200).json({
      message: "Order saved & email sent",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("❌ Error in /create:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// ========================
// ✅ Cart Order
// ========================
router.post("/complete-cart", async (req, res) => {
  console.log("🔥 /complete-cart route hit");
  console.log("📦 BODY RECEIVED:", req.body);

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      name: customerName,
      phone: customerPhone,
      cartItems,
    } = req.body;

    if (
      razorpay_payment_id == null ||
      razorpay_order_id == null ||
      razorpay_signature == null ||
      !email ||
      !customerName ||
      !customerPhone ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const products = cartItems.map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.price);

      return {
        productId: item.id || "",
        productName: item.name,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };
    });

    const totalAmount = products.reduce(
      (sum, p) => sum + p.totalPrice,
      0
    );

    const newOrder = new Order({
      products,
      amount: totalAmount,
      paymentId: razorpay_payment_id,
      customerName,
      customerEmail: email.toLowerCase(), // ✅ FIXED
      customerPhone,
      source: "cart",
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Cart order saved in DB");

    await sendGroupedInvoiceEmail({
      recipientEmail: email.toLowerCase(),
      invoiceId: razorpay_payment_id,
      customerName,
      customerEmail: email.toLowerCase(),
      customerPhone,
      products,
      totalAmount,
    });

    console.log("✅ Cart email sent");

    res.status(200).json({
      message: "Cart order saved & email sent",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("❌ Error in /complete-cart:", error);
    res.status(500).json({ message: error.message });
  }
});

// ========================
// 📦 Get Order History by Email
// ========================
router.get("/history/:email", async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const orders = await Order.find({
      customerEmail: email.toLowerCase(),
    }).sort({ date: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("❌ Error fetching order history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;