const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Example test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Load your other routes
app.use("/api/auth", require("../routes/auth"));
app.use("/api/chat", require("../routes/chat"));
app.use("/api/payment", require("../routes/paymentRoutes"));
app.use("/api/order", require("../routes/orderRoutes"));
app.use("/api/appointments", require("../routes/appointments"));

module.exports = app;
module.exports.handler = serverless(app);
