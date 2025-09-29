const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointments');
const transporter = require('../utils/mailer');
require('dotenv').config();

// POST /appointments - create a new appointment
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, date, service, timeSlot } = req.body;

    // Validate input
    if (!name || !phone || !email || !date || !service || !timeSlot) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if slot is already booked
    const existing = await Appointment.findOne({ date, timeSlot });
    if (existing) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Save new appointment
    const appointment = new Appointment({ name, phone, email, date, service, timeSlot });
    await appointment.save();

    // Send confirmation email to user and admin
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Appointment Confirmation - Your Booking is Confirmed!',
      html: `
        <h3>Hi ${name},</h3>
        <p>Thank you for booking an appointment with us.</p>
        <p><strong>Booking ID:</strong> ${appointment._id}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time Slot:</strong> ${timeSlot}</p>
        <p><strong>Service:</strong> ${service}</p>
        <br>
        <p>We look forward to seeing you!</p>
      `
    };

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Appointment Booked',
      html: `
        <h3>New Appointment Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time Slot:</strong> ${timeSlot}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Booking ID:</strong> ${appointment._id}</p>
      `
    };

    try {
      await transporter.sendMail(userMailOptions);
      await transporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      // Still proceed even if email fails
    }

    res.status(201).json({ message: "Appointment booked successfully", bookingId: appointment._id });

  } catch (error) {
    console.error("❌ Appointment booking error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /appointments?date=YYYY-MM-DD - get booked slots for that date
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const appointments = await Appointment.find({ date });
    const bookedSlots = appointments.map(app => app.timeSlot);
    res.json({ bookedSlots });
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
