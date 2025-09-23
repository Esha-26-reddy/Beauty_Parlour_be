const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["https://rohini-beauty-parlour.vercel.app/api/health", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection (cached for serverless)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
}
connectDB();

// Routes
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

// Health check
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

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "Hidden" : err.stack,
  });
});

// Export only the serverless handler for Vercel
module.exports = serverless(app);
