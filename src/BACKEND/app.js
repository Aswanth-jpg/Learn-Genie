const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require("dotenv").config();

// Debug environment loading
console.log('🔍 Environment Debug:');
console.log('Working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI length:', process.env.MONGO_URI ? process.env.MONGO_URI.length : 0);
console.log('PORT:', process.env.PORT);

// Simplified config for now
const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || "mongodb+srv://aswanthmurali2002:xaFv6VJlIdLfZYdA@ocs.eermj7b.mongodb.net/test?retryWrites=true&w=majority&appName=OCS"
};


const app = express();
const PORT = config.port;

// Utility functions
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const validateEmail = (email) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true
}));
app.use(express.json());

// Models
const User = require('./models/user');
const Course = require('./models/course');
const PurchasedCourse = require('./models/purchasedCourse');
const Notification = require('./models/notification');

// Import routes
const courseraRoutes = require('./routes/coursera');
const userProfileRoutes = require('./routes/userProfile');
const messageRoutes = require('./routes/message');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

// Initialize database connection
connectDB();

// =================================================================
// API ROUTES
// =================================================================

app.use('/api/coursera', courseraRoutes);
// The /api/courses route for internal Learn Genie courses and rating endpoints
// Make sure rating related endpoints are handled in courseraRoutes as well.
app.use('/api/courses', courseraRoutes); // This mounts courseraRoutes for /api/courses/:id/rate and /api/courses/:id/ratings
app.use('/api/user_profile', userProfileRoutes);
app.use('/api/messages', messageRoutes);

// Check if user exists
app.get("/api/check-user/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(200).json({ message: "User exists", exists: true });
        } else {
            return res.status(404).json({ message: "User not found", exists: false });
        }
    } catch (error) {
        console.error("Error checking user:", error);
        return res.status(500).json({ message: "Server error while checking user", error: error.message });
    }
});

// User login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        console.log('🔍 Login attempt:', { email, role, hasPassword: !!password });
        
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Basic email validation
        if (!validateEmail(email)) {
            console.log('❌ Invalid email format');
            return res.status(400).json({ message: "Please enter a valid email address" });
        }
        
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        console.log('✅ User found:', { email: user.email, role: user.role, passwordType: user.password.startsWith('$2b$') ? 'hashed' : 'plain' });
        
        // Compare password - handle both hashed and plain text passwords for migration
        let isMatch = false;
        
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (user.password.startsWith('$2b$')) {
            // Password is hashed, use bcrypt to compare
            isMatch = await bcrypt.compare(password, user.password);
            console.log('🔐 Bcrypt comparison result:', isMatch);
        } else {
            // Legacy plain text password, compare directly and then hash it
            if (user.password === password) {
                isMatch = true;
                // Hash the password for future use
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                await User.findByIdAndUpdate(user._id, { password: hashedPassword });
                console.log(`🔄 Migrated password for user: ${user.email}`);
            }
            console.log('📝 Plain text comparison result:', isMatch);
        }
        
        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (role && user.role.toLowerCase() !== role.toLowerCase()) {
            console.log('❌ Role mismatch:', { expected: role, actual: user.role });
            return res.status(403).json({ message: "Role mismatch" });
        }
        
        console.log('✅ Login successful for:', user.email);
        return res.status(200).json({
            message: "Login successful",
            user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        return res.status(500).json({ message: "Server error during login" });
    }
});

// Create new user
app.post("/api/insert", async (req, res) => {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ full_name, email, password: hashedPassword, role: role.toLowerCase() });

        await newUser.save();
        res.status(201).json({
            message: "User created successfully",
            user: { id: newUser._id, full_name: newUser.full_name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error("Error saving user to database:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
});

app.post('/api/get_courses', async (req, res) => {
    const { createdBy } = req.body;
    try {
        const query = createdBy ? { createdBy } : {};
        const courses = await Course.find(query)
        res.json(courses)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while retrieving courses' })
    }
});

// Legacy Coursera endpoint - consider if still needed or if /api/coursera provides enough
app.get('/api/coursera-courses', async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query;
        const start = (page - 1) * limit;
        const url = `https://api.coursera.org/api/courses.v1?start=${start}&limit=${limit}`;
        const response = await axios.get(url);
        const courses = response.data.elements || [];
        const normalizedCourses = courses.map(course => ({
            id: course.id,
            title: course.name,
            description: course.description || course.shortDescription || '',
            instructor: course.instructorIds ? course.instructorIds.join(', ') : 'Coursera',
            price: course.s12nPrice || 'Free', // Use s12nPrice or default to Free
            rating: course.averageFiveStarLog || 0,
            students: course.enrolledCount || 0,
            image: course.photoUrl || '',
            url: `https://coursera.org/learn/${course.slug}`,
            platform: 'Coursera',
            category: course.categories ? course.categories.join(', ') : '',
            duration: course.estimatedClassWorkload || '',
            language: course.primaryLanguages ? course.primaryLanguages[0] : 'English',
            level: course.level || 'Beginner'
        }));
        res.json({ courses: normalizedCourses });
    } catch (error) {
        console.error("Error fetching Coursera data:", error);
        res.status(500).json({ message: "Failed to fetch Coursera courses." });
    }
});

// Add new course
app.post('/api/course_add', async (req, res) => {
    const { title, description, duration, category, price, youtubeLink, createdBy } = req.body;
    if (!title || !description || !duration || !category || !price || !youtubeLink || !createdBy) {
        return res.status(400).json({ message: "All course fields and createdBy are required" });
    }
    try {
        const newCourse = new Course({ title, description, duration, category, price, youtubeLink, createdBy });
        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
        console.error("Error saving course:", error);
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
});

app.post('/api/retrieve_name/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('full_name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ full_name: user.full_name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get course count
app.get('/api/course_count', async (req, res) => {
    try {
        const count = await Course.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error fetching course count:", error);
        res.status(500).json({ message: 'Error fetching course count', error: error.message });
    }
});

// Get all courses from your internal DB (Learn Genie courses)
// This route will handle requests to /api/courses when no further path is specified,
// and it won't conflict with /api/courses/:id/rate or /api/courses/:id/ratings
// because those are handled by the courseraRoutes middleware mounted earlier.
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({});
        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get all managers
app.get('/api/users/managers', async (req, res) => {
    try {
        const managers = await User.find({ role: 'manager' }).select('-password');
        res.status(200).json(managers);
    } catch (error) {
        console.error("Error fetching managers:", error);
        res.status(500).json({ message: 'Error fetching managers', error: error.message });
    }
});

// Delete user by ID
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    try {
        const result = await User.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully', deletedUser: { id: result._id, email: result.email } });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Add new purchased course
app.post('/api/purchase_course', async (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
        return res.status(400).json({ message: 'userId and courseId are required' });
    }
    try {
        const purchase = new PurchasedCourse({ userId, courseId });
        await purchase.save();
        await Notification.create({
            userId,
            type: 'purchase',
            courseId,
            message: 'You have successfully purchased a new course!',
        });
        res.status(201).json({ message: 'Course purchase saved', purchase });
    } catch (error) {
        console.error('Error saving purchased course:', error);
        res.status(500).json({ message: 'Error saving purchased course', error: error.message });
    }
});

// Get all purchased courses for a user
app.get('/api/purchased_courses/:userId', async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }
    try {
        const purchases = await PurchasedCourse.find({ userId });
        const courseIds = purchases.map(p => p.courseId);
        const courses = await Course.find({ _id: { $in: courseIds } });
        const coursesWithPurchaseData = courses.map(course => {
            const purchase = purchases.find(p => p.courseId.toString() === course._id.toString());
            return {
                ...course.toObject(),
                purchaseDate: purchase ? purchase.purchaseDate : null,
                progress: purchase ? purchase.progress : 0
            };
        });
        res.status(200).json({ courses: coursesWithPurchaseData });
    } catch (error) {
        console.error('Error fetching purchased courses:', error);
        res.status(500).json({ message: 'Error fetching purchased courses', error: error.message });
    }
});

// Delete course by ID
app.delete('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { managerId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid course ID format' });
    }
    try {
        const manager = await User.findById(managerId);
        if (!manager || manager.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can delete courses' });
        }
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await course.deleteOne();
        res.status(200).json({ message: 'Course deleted successfully', deletedCourse: { id: course._id, title: course.title } });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
});

// Update course by ID
app.put('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, duration, category, price, youtubeLink, managerId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid course ID format' });
    }
    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.createdBy.toString() !== managerId) { // Ensure managerId matches createdBy
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        course.title = title;
        course.description = description;
        course.duration = duration;
        course.category = category;
        course.price = price;
        course.youtubeLink = youtubeLink;
        await course.save();
        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
});

// Get courses by manager
app.get('/api/manager_courses/:managerId', async (req, res) => {
    const { managerId } = req.params;
    try {
        const courses = await Course.find({ createdBy: managerId });
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching manager courses:', error);
        res.status(500).json({ message: 'Error fetching manager courses', error: error.message });
    }
});

// Delete all courses by a manager
app.delete('/api/courses/by-manager/:managerId', async (req, res) => {
    const { managerId } = req.params;
    try {
        const result = await Course.deleteMany({ createdBy: managerId });
        res.status(200).json({ message: 'All courses by manager deleted', deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Error deleting courses by manager:', error);
        res.status(500).json({ message: 'Error deleting courses by manager', error: error.message });
    }
});

// Get total purchased course count
app.get('/api/purchased_course_count', async (req, res) => {
    try {
        const count = await PurchasedCourse.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching purchased course count', error: error.message });
    }
});

// Update user profile or password
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { full_name, email, current_password, new_password } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (current_password !== undefined && new_password !== undefined) {
            // Verify current password
            const isMatch = await bcrypt.compare(current_password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(new_password, salt);
        }
        if (full_name !== undefined) user.full_name = full_name;
        if (email !== undefined) user.email = email;
        await user.save();
        res.status(200).json({
            message: 'User updated successfully',
            user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Mark a purchased course as completed
app.post('/api/mark_course_completed', async (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
        return res.status(400).json({ message: 'userId and courseId are required' });
    }
    try {
        const purchase = await PurchasedCourse.findOne({ userId, courseId });
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        purchase.progress = 100;
        await purchase.save();
        
        // Find the course to include its title in the notification message
        const course = await Course.findById(courseId);
        const courseTitle = course ? course.title : 'a course';

        await Notification.create({
            userId,
            type: 'completion',
            courseId,
            message: `Congratulations! You have completed "${courseTitle}" and earned a certificate.`,
        });
        res.status(200).json({ message: 'Course marked as completed' });
    } catch (error) {
        console.error('Error marking course as completed:', error);
        res.status(500).json({ message: 'Error marking course as completed', error: error.message });
    }
});

// Update course progress for a user
app.post('/api/update_course_progress', async (req, res) => {
    const { userId, courseId, progress } = req.body;
    if (!userId || !courseId || typeof progress !== 'number') {
        return res.status(400).json({ message: 'userId, courseId, and progress are required' });
    }
    try {
        const purchase = await PurchasedCourse.findOneAndUpdate(
            { userId, courseId },
            { progress: progress },
            { new: true, upsert: true } // upsert creates if not found, new returns updated doc
        );
        
        if (!purchase) {
            // This case should ideally not be reached with upsert:true, but good for explicit check
            return res.status(404).json({ message: 'Purchase not found or could not be updated' });
        }
        res.status(200).json({ message: 'Course progress updated', progress: purchase.progress });
    } catch (error) {
        console.error('Error updating course progress:', error);
        res.status(500).json({ message: 'Error updating course progress', error: error.message });
    }
});

// Get learner progress for a manager
app.get('/api/manager/learner_progress/:managerId', async (req, res) => {
    const { managerId } = req.params;
    try {
        const courses = await Course.find({ createdBy: managerId });
        const courseIds = courses.map(c => c._id.toString());
        const purchased = await PurchasedCourse.find({ courseId: { $in: courseIds } });
        res.json({ purchased });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching learner progress', error: error.message });
    }
});

// Get revenue for a manager
app.get('/api/manager/revenue/:managerId', async (req, res) => {
    const { managerId } = req.params;
    try {
        const courses = await Course.find({ createdBy: managerId });
        const courseIds = courses.map(c => c._id.toString());
        const purchased = await PurchasedCourse.find({ courseId: { $in: courseIds } });
        const courseMap = {};
        courses.forEach(c => {
            courseMap[c._id.toString()] = {
                title: c.title,
                price: parseFloat((c.price || '0').replace(/[^0-9.]/g, '')) || 0,
                count: 0,
                revenue: 0
            };
        });
        purchased.forEach(p => {
            if (courseMap[p.courseId]) {
                courseMap[p.courseId].count += 1;
                courseMap[p.courseId].revenue += courseMap[p.courseId].price;
            }
        });
        res.json({ revenue: Object.values(courseMap) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching revenue', error: error.message });
    }
});

// =================================================================
// NOTIFICATION ROUTES (MOVED TO THE CORRECT POSITION)
// =================================================================

app.get('/api/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId format' });
    }
    try {
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

app.post('/api/notifications/mark_read', async (req, res) => {
    const { notificationId } = req.body;
    if (!notificationId) {
        return res.status(400).json({ message: 'notificationId is required' });
    }
    try {
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
});


// =================================================================
// FINAL MIDDLEWARE (MUST BE LAST)
// =================================================================

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            message: 'Validation Error',
            errors: errors
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            message: `${field} already exists`,
            error: 'Duplicate entry'
        });
    }
    
    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    
    // Default error response
    res.status(err.statusCode || 500).json({
        message: err.message || 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler for any requests that don't match a route
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        requestedUrl: req.originalUrl
    });
});

// Start the server
const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

start();