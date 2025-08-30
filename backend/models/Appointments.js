const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },         // ✅ added email
  date: { type: String, required: true },           // format: YYYY-MM-DD
  service: { type: String, required: true },
  timeSlot: { type: String, required: true }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
