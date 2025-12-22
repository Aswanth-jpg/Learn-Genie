const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
        type: String,
        required: [true, 'Course category is required'],
        trim: true
    },
    duration: {
        type: String,
        required: [true, 'Course duration is required'],
        trim: true
    },
    price: {
        type: String,
        required: [true, 'Course price is required'],
        trim: true
    },
    youtubeLink: {
        type: String,
        required: [true, 'YouTube link is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(v);
            },
            message: 'Please enter a valid YouTube URL'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'CreatedBy field is required']
    },
    ratings: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                min: [1, 'Rating must be at least 1'],
                max: [5, 'Rating cannot exceed 5'],
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

// Add index for better query performance
courseSchema.index({ createdBy: 1 });
courseSchema.index({ category: 1 });

module.exports = mongoose.model('Course', courseSchema);