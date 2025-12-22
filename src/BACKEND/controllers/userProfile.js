const UserProfile = require('../models/userProfile');
const mongoose = require('mongoose');

// Save or update user profile
exports.saveProfile = async (req, res) => {
  try {
    console.log("==== /api/user_profile/save called ====");
    console.log("Received body:", req.body);
    let { userId, twelfthStream, degree, postGrad, areasOfInterest } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
    userId = new mongoose.Types.ObjectId(userId);
    let profile = await UserProfile.findOne({ userId });
    if (profile) {
      // Update existing profile
      profile.twelfthStream = twelfthStream;
      profile.degree = degree;
      profile.postGrad = postGrad;
      profile.areasOfInterest = areasOfInterest;
      await profile.save();
    } else {
      // Create new profile
      profile = new UserProfile({ userId, twelfthStream, degree, postGrad, areasOfInterest });
      await profile.save();
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error("Profile save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    let { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
    userId = new mongoose.Types.ObjectId(userId);
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 