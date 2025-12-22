const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  twelfthStream: { type: String },
  degree: { type: String },
  postGrad: { type: String },
  areasOfInterest: [{ type: String }],
});

module.exports = mongoose.model('UserProfile', userProfileSchema); 