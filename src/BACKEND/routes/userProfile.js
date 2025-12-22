const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfile');

// Save or update user profile
router.post('/save', userProfileController.saveProfile);

// Get user profile by userId
router.get('/:userId', userProfileController.getProfile);

module.exports = router; 