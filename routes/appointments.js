const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointments");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// ✅ Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY missing");
  process.exit(1);
}

if (!process.env.EMAIL_USER) {
  console.error("❌ EMAIL_USER missing");
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ============================
// POST - Create Appointment
// ============================
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, date, service, timeSlot } = req.body;

    if (!name || !phone || !email || !date || !service || !timeSlot) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check slot availability
    const existing = await Appointment.findOne({ date, timeSlot });
    if (existing) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Save appointment
    const appointment = new Appointment({
      name,
      phone,
      email: email.toLowerCase(),
      date,
      service,
      timeSlot,
    });

    await appointment.save();

    // ✅ Respond immediately
    res.status(201).json({
      message: "Appointment booked successfully",
      bookingId: appointment._id,
    });

    // ============================
    // 📧 Send Emails in Background
    // ============================

    const userEmail = {
      to: email.toLowerCase(),
      from: {
        email: process.env.EMAIL_USER,
        name: "Rohini Beauty Parlour",
      },
      subject: "Appointment Confirmation - Booking Confirmed",
      html: `
        <div style="font-family: Arial;">
          <h3>Hi ${name},</h3>
          <p>Your appointment has been confirmed 🎉</p>
          <p><strong>Booking ID:</strong> ${appointment._id}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
          <p><strong>Service:</strong> ${service}</p>
          <br/>
          <p>Thank you for choosing Rohini Beauty Parlour!</p>
        </div>
      `,
    };

    const adminEmail = {
      to: process.env.EMAIL_USER,
      from: {
        email: process.env.EMAIL_USER,
        name: "Rohini Beauty Parlour",
      },
      subject: "New Appointment Booked",
      html: `
        <div style="font-family: Arial;">
          <h3>New Appointment Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Booking ID:</strong> ${appointment._id}</p>
        </div>
      `,
    };

    // Send without blocking response
    sgMail.send(userEmail).catch((err) =>
      console.error("⚠ User email failed:", err.response?.body || err.message)
    );

    sgMail.send(adminEmail).catch((err) =>
      console.error("⚠ Admin email failed:", err.response?.body || err.message)
    );

  } catch (error) {
    console.error("❌ Booking error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============================
// GET - Fetch booked slots
// ============================
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const appointments = await Appointment.find({ date });
    const bookedSlots = appointments.map((app) => app.timeSlot);

    res.json({ bookedSlots });
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
