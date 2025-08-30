const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Your other routes
app.use("/auth", require("../routes/auth"));
app.use("/chat", require("../routes/chat"));
app.use("/payment", require("../routes/paymentRoutes"));
app.use("/order", require("../routes/orderRoutes"));
app.use("/appointments", require("../routes/appointments"));

module.exports = app;
module.exports.handler = serverless(app);
