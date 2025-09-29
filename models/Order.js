const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
});

const orderSchema = new mongoose.Schema({
  products: [productSchema],
  amount: Number,
  paymentId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  source: String,
  date: { type: Date, default: Date.now }, // Important for sorting!
});

module.exports = mongoose.model("Order", orderSchema);
