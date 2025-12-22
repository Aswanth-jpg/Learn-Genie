const Feedback = require('../models/message');

// Save a new contact message
exports.createMessage = async (req, res) => {
  try {
    const { name, email, number, message } = req.body;
    if (!name || !email || !number || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const newFeedback = new Feedback({ name, email, number, message });
    await newFeedback.save();
    res.status(201).json({ success: true, message: 'Feedback saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all contact messages
exports.getAllMessages = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 