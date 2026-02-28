const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ====================
// ✅ Register Route
// ====================
router.post("/register", async (req, res) => {
  try {
    let { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase().trim();
    phone = phone.trim();

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ====================
// ✅ Login Route
// ====================
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ====================
// ✅ Forgot Password (Using SendGrid)
// ====================
router.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = verificationCode;
    user.resetCodeExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const msg = {
      to: email,
      from: "rohinibeautyparlour01@gmail.com", // ⚠ MUST be verified in SendGrid
      subject: "Password Reset Verification Code",
      text: `Your password reset code is: ${verificationCode}. It expires in 15 minutes.`,
      html: `
        <h2>Password Reset Code</h2>
        <p>Your verification code is:</p>
        <h1>${verificationCode}</h1>
        <p>This code expires in 15 minutes.</p>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ message: "Verification code sent to your email." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to send verification code." });
  }
});

// ====================
// ✅ Verify Code
// ====================
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.resetCode !== code ||
      !user.resetCodeExpiry ||
      user.resetCodeExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.status(200).json({ message: "Code verified successfully" });

  } catch (err) {
    console.error("Verify Code Error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
});

// ====================
// ✅ Reset Password
// ====================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user.resetCode !== code ||
      !user.resetCodeExpiry ||
      user.resetCodeExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error during password reset" });
  }
});

module.exports = router;
