const mongoose = require('mongoose');

const purchasedCourseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%']
  }
}, {
  timestamps: true
});

// Add composite index to prevent duplicate purchases
purchasedCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('PurchasedCourse', purchasedCourseSchema); 