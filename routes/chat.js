const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/chatbot - handles user messages
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: 'Message cannot be empty.' });
  }

  try {
    // Send message to Python Flask chatbot backend
   const response = await axios.post('http://localhost:5001/chat', { message });

    // Get the response from Python
    const reply = response.data.reply;

    // Send the reply back to the React frontend
    res.json({ reply });
  } catch (error) {
    console.error('Error from Python chatbot:', error.message);
    res.status(500).json({ reply: 'Sorry, I am unable to respond right now. Please try again later.' });
  }
});

module.exports = router;
