require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// =======================
// Middleware
// =======================
app.use(
  cors({
    origin: [
       "https://rohini-beauty-parlour.vercel.app", // deployed frontend
      "http://localhost:3000", // local dev
    ],
    credentials: true,
  })
);

app.use(express.json());

// =======================
// MongoDB connection
// =======================
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

// =======================
// Routes (FIXED PATHS ✅)
// =======================
const authRoutes = require("../routes/auth");
const chatbotRoutes = require("../routes/chat");
const paymentRoutes = require("../routes/paymentRoutes");
const appointmentRoutes = require("../routes/appointments");
const orderRoutes = require("../routes/orderRoutes");
const confirmationEmailRoute = require("../routes/sendConfirmationEmail");

app.use("/api/auth", authRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", confirmationEmailRoute);

// =======================
// Health check
// =======================
app.get("/api/health", (req, res) => {
  let dbHealth = "UNKNOWN";

  switch (mongoose.connection.readyState) {
    case 0:
      dbHealth = "DISCONNECTED";
      break;
    case 1:
      dbHealth = "CONNECTED";
      break;
    case 2:
      dbHealth = "CONNECTING";
      break;
    case 3:
      dbHealth = "DISCONNECTING";
      break;
  }

  res.status(200).json({
    message: "Welcome",
    status: "BE UP",
    database: dbHealth,
    timestamp: new Date().toISOString(),
  });
});

// =======================
// Global error handler
// =======================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "Hidden" : err.stack,
  });
});

// =======================
// Start server
// =======================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
