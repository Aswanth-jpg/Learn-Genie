const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message');

// Save a new contact message
router.post('/', messageController.createMessage);

// Get all contact messages
router.get('/', messageController.getAllMessages);

module.exports = router; 