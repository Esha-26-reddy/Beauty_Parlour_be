require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://rohini-beauty-parlour.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

// Routes
const authRoutes = require("../routes/auth");
const chatbotRoutes = require("../routes/chat");
const paymentRoutes = require("../routes/paymentRoutes");
const appointmentRoutes = require("../routes/appointments");
const orderRoutes = require("../routes/orderRoutes");
const confirmationEmailRoute = require("../routes/sendConfirmationEmail");

// 🚨 Don’t prefix `/api` again → Vercel already does it
app.use("/auth", authRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/payment", paymentRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/orders", orderRoutes);
app.use("/", confirmationEmailRoute);

// Health check
app.get("/health", (req, res) => {
  try {
    let dbHealth = "UNKNOWN";
    switch (mongoose.connection.readyState) {
      case 0: dbHealth = "DISCONNECTED"; break;
      case 1: dbHealth = "CONNECTED"; break;
      case 2: dbHealth = "CONNECTING"; break;
      case 3: dbHealth = "DISCONNECTING"; break;
    }
    res.status(200).json({
      message: "Welcome",
      status: "BE UP",
      database: dbHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "DOWN",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "Hidden" : err.stack,
  });
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
