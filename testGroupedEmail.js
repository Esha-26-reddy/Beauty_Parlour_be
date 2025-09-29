require("dotenv").config();
const sendGroupedInvoiceEmail = require("./utils/sendGroupedInvoiceEmail");

async function test() {
  const fakeInvoiceData = {
    invoiceId: "TEST12345",
    customerName: "Test User",
    customerEmail: "eshavangala26@gmail.com", // This can be your real test email
    customerPhone: "9876543210",
    products: [
      { productName: "Shampoo", quantity: 2, unitPrice: 120, totalPrice: 240 },
      { productName: "Conditioner", quantity: 1, unitPrice: 180, totalPrice: 180 },
    ],
    totalAmount: 420,
  };

  try {
    console.log("📧 Sending test grouped invoice email...");
    await sendGroupedInvoiceEmail(fakeInvoiceData.customerEmail, fakeInvoiceData);
    console.log("✅ Test email sent! Check your inbox.");
  } catch (err) {
    console.error("❌ Test email failed:", err);
  }
}

test();
