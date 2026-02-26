const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointments');
const transporter = require('../utils/mailer');
require('dotenv').config();

// POST - Create Appointment
router.post('/', async (req, res) => {
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
      email,
      date,
      service,
      timeSlot
    });

    await appointment.save();

    // 🔥 Respond immediately
    res.status(201).json({
      message: "Appointment booked successfully",
      bookingId: appointment._id
    });

    // 🔥 Send emails in background
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Appointment Confirmation - Booking Confirmed',
      html: `
        <h3>Hi ${name},</h3>
        <p>Your appointment has been confirmed.</p>
        <p><strong>Booking ID:</strong> ${appointment._id}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>
        <p><strong>Service:</strong> ${service}</p>
        <br/>
        <p>Thank you!</p>
      `
    };

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Appointment Booked',
      html: `
        <h3>New Appointment</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Booking ID:</strong> ${appointment._id}</p>
      `
    };

    transporter.sendMail(userMailOptions).catch(err =>
      console.error("User email error:", err.message)
    );

    transporter.sendMail(adminMailOptions).catch(err =>
      console.error("Admin email error:", err.message)
    );

  } catch (error) {
    console.error("Booking error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET - Fetch booked slots
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const appointments = await Appointment.find({ date });
    const bookedSlots = appointments.map(app => app.timeSlot);

    res.json({ bookedSlots });

  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
