const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },

  // Fields for forgot password feature
  resetCode: { type: String },
  resetCodeExpiry: { type: Date },
});

module.exports = mongoose.model('User', UserSchema);
