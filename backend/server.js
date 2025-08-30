require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: ["https://rohini-beauty-parlour.vercel.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected \n"))
  .catch((err) => console.error("MongoDB error:", err));

// Routes
const authRoutes = require("./routes/auth");
const chatbotRoutes = require("./routes/chat");
const paymentRoutes = require("./routes/paymentRoutes");
const cartPaymentRoutes = require("./routes/payment");
const appointmentRoutes = require("./routes/appointments");
const orderRoutes = require("./routes/orderRoutes");
const confirmationEmailRoute = require("./routes/sendConfirmationEmail");

app.use("/api/auth", authRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", confirmationEmailRoute);

app.get("/api/orders/test", (req, res) => {
  res.json({ message: "Order routes test works!" });
});

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "Hidden" : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\nServer running at http://localhost:${PORT}`));
