const express = require('express');
const axios = require('axios');
const router = express.Router();
const Course = require('../models/course'); // Ensure Course model is imported
const mongoose = require('mongoose');

// Coursera API base URL
const COURSERA_API_BASE = 'https://api.coursera.org/api';

// Utility function to normalize Coursera course data
const normalizeCourseraCourse = (course) => ({
    id: course.id,
    title: course.name,
    description: course.description || course.shortDescription || '',
    instructor: course.instructorIds ? course.instructorIds.map(id => `Instructor ${id}`).join(', ') : 'Coursera', // Placeholder for instructor names
    price: course.s12nPrice || 'Free', // Use a more direct price if available
    rating: course.averageFiveStarLog || 0,
    students: course.enrolledCount || 0,
    image: course.photoUrl || '',
    url: `https://coursera.org/learn/${course.slug}`,
    platform: 'Coursera',
    category: course.categories ? course.categories.join(', ') : '',
    duration: course.estimatedClassWorkload || '',
    language: course.primaryLanguages ? course.primaryLanguages[0] : 'English',
    level: course.level || 'Beginner',
    certificate: course.certificateAvailable || false,
    startDate: course.startDate || null,
    endDate: course.endDate || null
});

// Get all courses with pagination
router.get('/courses', async (req, res) => {
    try {
        // We'll ignore the page/limit query params for now and always fetch first 5 pages (100 each)
        const PAGES_TO_FETCH = 5;
        const PAGE_SIZE = 100;
        let allCourses = [];

        for (let page = 0; page < PAGES_TO_FETCH; page++) {
            const start = page * PAGE_SIZE;
            let url = `${COURSERA_API_BASE}/courses.v1?start=${start}&limit=${PAGE_SIZE}`;
            const response = await axios.get(url);
            const courses = response.data.elements || [];
            allCourses = allCourses.concat(courses);
            // If there are no more courses, break early
            if (!response.data.paging || !response.data.paging.next) break;
        }

        // Normalize the courses
        const normalizedCourses = allCourses.map(normalizeCourseraCourse);

        res.json({
            courses: normalizedCourses,
            total: normalizedCourses.length
        });
    } catch (error) {
        console.error('Error fetching Coursera courses:', error);
        res.status(500).json({
            message: 'Failed to fetch Coursera courses',
            error: error.message
        });
    }
});

// Get course by ID
router.get('/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const url = `${COURSERA_API_BASE}/courses.v1/${id}`;

        const response = await axios.get(url);
        // Assuming course details are in 'elements' for a direct ID lookup or linked data
        const course = response.data.elements ? response.data.elements[0] : null;
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const normalizedCourse = normalizeCourseraCourse(course);
        res.json({ course: normalizedCourse });
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({
            message: 'Failed to fetch course details',
            error: error.message
        });
    }
});

// Search courses
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const start = (page - 1) * limit;
        const url = `${COURSERA_API_BASE}/courses.v1?q=${encodeURIComponent(q)}&start=${start}&limit=${limit}`;

        const response = await axios.get(url);
        const courses = response.data.elements || [];

        const normalizedCourses = courses.map(normalizeCourseraCourse);

        res.json({
            courses: normalizedCourses,
            searchQuery: q,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(response.data.paging.total / limit),
                totalResults: response.data.paging.total
            }
        });
    } catch (error) {
        console.error('Error searching Coursera courses:', error);
        res.status(500).json({
            message: 'Failed to search courses',
            error: error.message
        });
    }
});

// Get courses by category
router.get('/categories/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const start = (page - 1) * limit;

        const url = `${COURSERA_API_BASE}/courses.v1?start=${start}&limit=${limit}`;
        const response = await axios.get(url);

        let courses = response.data.elements || [];

        // Filter by category (case-insensitive)
        if (category && category !== 'all') {
            courses = courses.filter(course =>
                course.categories &&
                course.categories.some(cat =>
                    cat.toLowerCase().includes(category.toLowerCase())
                )
            );
        }

        const normalizedCourses = courses.map(normalizeCourseraCourse);

        res.json({
            courses: normalizedCourses,
            category: category,
            pagination: {
                currentPage: parseInt(page),
                totalResults: courses.length
            }
        });
    } catch (error) {
        console.error('Error fetching courses by category:', error);
        res.status(500).json({
            message: 'Failed to fetch courses by category',
            error: error.message
        });
    }
});

// Get popular courses (by enrollment count)
router.get('/popular', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const url = `${COURSERA_API_BASE}/courses.v1?start=0&limit=100`;

        const response = await axios.get(url);
        let courses = response.data.elements || [];

        // Sort by enrollment count (descending)
        courses.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));

        // Take top courses
        courses = courses.slice(0, parseInt(limit));

        const normalizedCourses = courses.map(normalizeCourseraCourse);

        res.json({
            courses: normalizedCourses,
            total: normalizedCourses.length
        });
    } catch (error) {
        console.error('Error fetching popular courses:', error);
        res.status(500).json({
            message: 'Failed to fetch popular courses',
            error: error.message
        });
    }
});

// Get course statistics
router.get('/stats', async (req, res) => {
    try {
        const url = `${COURSERA_API_BASE}/courses.v1?start=0&limit=1000`;
        const response = await axios.get(url);
        const courses = response.data.elements || [];

        const stats = {
            totalCourses: courses.length,
            totalEnrollments: courses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0),
            averageRating: courses.reduce((sum, course) => sum + (course.averageFiveStarLog || 0), 0) / courses.length,
            languages: [...new Set(courses.flatMap(course => course.primaryLanguages || []))],
            categories: [...new Set(courses.flatMap(course => course.categories || []))],
            levels: [...new Set(courses.map(course => course.level || 'Beginner'))]
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching course statistics:', error);
        res.status(500).json({
            message: 'Failed to fetch course statistics',
            error: error.message
        });
    }
});

// POST /courses/:id/rate - Add or update a rating for a course by a user
router.post('/:id/rate', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, rating } = req.body;
        // Validate ObjectId
        if (!userId || !rating) {
            return res.status(400).json({ message: 'userId and rating are required.' });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId.' });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid courseId.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        // Remove previous rating by this user if exists
        course.ratings = course.ratings.filter(r => r.userId.toString() !== userId);
        // Add new rating
        // Using 'new mongoose.Types.ObjectId(userId)' for explicit creation
        course.ratings.push({ userId: new mongoose.Types.ObjectId(userId), rating });
        await course.save();
        res.json({ message: 'Rating submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit rating.', error: error.message });
    }
});

// GET /courses/:id/ratings - Get average rating and optionally the user's rating
router.get('/:id/ratings', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid courseId.' });
        }
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        const ratings = course.ratings || [];
        const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) : 0;
        let userRating = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const found = ratings.find(r => r.userId.toString() === userId);
            if (found) userRating = found.rating;
        }
        res.json({ average: avgRating, count: ratings.length, userRating });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch ratings.', error: error.message });
    }
});

// GET /courses/:id/all-ratings - Get all ratings for a course (for manager view)
router.get('/:id/all-ratings', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).populate('ratings.userId', 'full_name email');
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        res.json({ ratings: course.ratings });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all ratings.', error: error.message });
    }
});

module.exports = router;