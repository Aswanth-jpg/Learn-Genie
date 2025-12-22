"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Users, BookOpen, BarChart3, LogOut, Home, Eye, Calendar, FileText, UserCircle } from "lucide-react"
import "./CourseManager.css"
import logo from './logo.png';
import axios from "axios";
import { useToast } from '../Toast/ToastContext';

import { useRef } from 'react';

export default function CourseManagerDashboard() {
  const { success: showSuccess, error: showError } = useToast();
  const [courses, setCourses] = useState([]);

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    price: "",
    youtubeLink: ""
  })

  const [createError, setCreateError] = useState("");
  const [createErrors, setCreateErrors] = useState({});

  // Get manager ID/email from localStorage
  const manager = JSON.parse(localStorage.getItem('user'));
  const managerId = manager?.id || manager?.email;

  // When opening the create form, clear any previous error
  const openCreateForm = () => {
    setCreateError("");
    setShowCreateForm(true);
  };

  const handleCreateCourse = async () => {
    const errors = {};
    if (!newCourse.title) errors.title = "Course title is required.";
    if (!newCourse.category) errors.category = "Category is required.";
    if (!newCourse.duration) errors.duration = "Duration is required.";
    if (!newCourse.price) errors.price = "Price is required.";
    if (!newCourse.youtubeLink) errors.youtubeLink = "YouTube link is required.";
    if (!newCourse.description) errors.description = "Description is required.";
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setCreateError(""); // Only clear error on successful creation
    if (newCourse.title && newCourse.description && newCourse.category && newCourse.duration && newCourse.price && newCourse.youtubeLink) {
      const course = {
        ...newCourse,
        createdBy: managerId, // Attach manager ID/email
        enrolledStudents: 0,
        status: "Draft",
        createdDate: new Date().toISOString().split("T")[0],
        completionRate: 0,
      }
      try{
        const response=await axios.post('http://localhost:5000/api/course_add',course);
        if(response.status===201){
          showSuccess('Course added Successfully')
          setNewCourse({ title: "", description: "", category: "", duration: "", price: "", youtubeLink: "" });
          setShowCreateForm(false);
        }else{
          console.error("failed to create course",response.data.message);
        }
      }catch(error){
        console.error("error while creating course",error);
      }
    }
  }

  // GET total course count



  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
        data: { managerId }
      });
      if (response.status === 200) {
        setCourses(courses.filter((course) => course.id !== courseId));
        showSuccess('Course deleted successfully!');
      } else {
        showError(response.data.message || 'Failed to delete course.');
      }
    } catch (error) {
      showError('Error deleting course: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusToggle = (courseId) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, status: course.status === "Active" ? "Inactive" : "Active" } : course,
      ),
    )
  }

  // State for logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSignOut = () => {
    setShowLogoutModal(true);
  }

  const handleHome = () => {
    window.location.href = "/"
  }

  const [totalCourses, setTotalCourses] = useState(0);
  const [courses2, setCourses2] = useState([]);

  const fetchCourseCount = async () => {
      try{
        const response=await axios.get('http://localhost:5000/api/course_count');
        setTotalCourses(response.data.count)
      }catch(error){
        console.error("Error fetching course count:",error);
        
      }
    }

  // Fetch all courses for managers
  const fetchAllCourses = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/get_courses', { createdBy: managerId });
      if (Array.isArray(response.data)) {
        setCourses(
          response.data.map(course => ({
            id: course._id,
            title: course.title,
            description: course.description,
            category: course.category,
            duration: course.duration,
            price: course.price,
            youtubeLink: course.youtubeLink,
            createdBy: course.createdBy,
            enrolledStudents: course.enrolledStudents || 0,
            status: course.status || "Active",
            createdDate: course.createdDate || (course._id ? new Date(parseInt(course._id.substring(0,8), 16) * 1000).toISOString().split('T')[0] : ""),
            completionRate: course.completionRate || 0,
          }))
        );
      } else {
        setCourses([]);
      }
    } catch (error) {
      setCourses([]);
      console.error("Error fetching courses:", error);
    }
  };

  const [learners, setLearners] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(false);

  // Fetch all learners (users with role 'learner')
  const fetchLearners = async () => {
    setLoadingLearners(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      if (Array.isArray(response.data)) {
        setLearners(response.data.filter(user => user.role && user.role.toLowerCase() === 'learner'));
      } else {
        setLearners([]);
      }
    } catch (error) {
      setLearners([]);
      console.error('Error fetching learners:', error);
    } finally {
      setLoadingLearners(false);
    }
  };

  // Delete learner by ID
  const handleDeleteLearner = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this learner?")) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${userId}`);
      if (response.status === 200) {
        setLearners(learners.filter(l => l._id !== userId));
        showSuccess('Learner deleted successfully!');
      } else {
        showError(response.data.message || 'Failed to delete learner.');
      }
    } catch (error) {
      showError('Error deleting learner: ' + (error.response?.data?.message || error.message));
    }
  };

  const [userMap, setUserMap] = useState({});

  // New: State for filtered learners (only those who purchased manager's courses)
  const [filteredLearners, setFilteredLearners] = useState([]);

  // Fetch all users to map manager IDs/emails to names
  const fetchUserMap = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      if (Array.isArray(response.data)) {
        // Map both _id and email to full_name (or email if no full_name)
        const map = {};
        response.data.forEach(user => {
          if (user._id) map[user._id] = user.full_name || user.email;
          if (user.email) map[user.email] = user.full_name || user.email;
        });
        setUserMap(map);
      }
    } catch (error) {
      setUserMap({});
      console.error('Error fetching users for manager map:', error);
    }
  };

  // New: State for learner progress
  const [learnerProgress, setLearnerProgress] = useState({});

  // New: Fetch learner progress for this manager's courses
  const fetchLearnerProgress = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/manager/learner_progress/${managerId}`);
      if (response.data && Array.isArray(response.data.purchased)) {
        // Group by learner
        const progressMap = {};
        response.data.purchased.forEach(p => {
          if (!progressMap[p.userId]) progressMap[p.userId] = [];
          progressMap[p.userId].push({ courseId: p.courseId, progress: p.progress });
        });
        setLearnerProgress(progressMap);
      }
    } catch (error) {
      setLearnerProgress({});
      console.error('Error fetching learner progress:', error);
    }
  };

  // New: State for revenue
  const [revenueData, setRevenueData] = useState([]);

  // New: Fetch revenue for this manager
  const fetchRevenue = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/manager/revenue/${managerId}`);
      if (response.data && Array.isArray(response.data.revenue)) {
        setRevenueData(response.data.revenue);
      }
    } catch (error) {
      setRevenueData([]);
      console.error('Error fetching revenue:', error);
    }
  };

  // Update enrolledStudents and completionRate for each course after fetching purchases
  const updateCourseStats = async () => {
    try {
      // Fetch all purchases for manager's courses
      const response = await axios.get(`http://localhost:5000/api/manager/learner_progress/${managerId}`);
      if (response.data && Array.isArray(response.data.purchased)) {
        const purchased = response.data.purchased;
        setCourses(prevCourses => prevCourses.map(course => {
          const coursePurchases = purchased.filter(p => p.courseId === course.id);
          const enrolledStudents = coursePurchases.length;
          // Completion rate: percent of students with progress 100
          const completed = coursePurchases.filter(p => p.progress === 100).length;
          const completionRate = enrolledStudents > 0 ? Math.round((completed / enrolledStudents) * 100) : 0;
          return { ...course, enrolledStudents, completionRate };
        }));
      }
    } catch (error) {
      // Do nothing, keep previous stats
    }
  };

  // Auto-refresh interval (ms)
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchCourseCount();
    fetchAllCourses();
    fetchLearners();
    fetchUserMap();
    fetchLearnerProgress();
    fetchRevenue();
    updateCourseStats();
  };

  useEffect(() => {
    fetchCourseCount();
    fetchAllCourses();
    fetchLearners();
    fetchUserMap();
    fetchLearnerProgress(); // New
    fetchRevenue(); // New
    updateCourseStats(); // New

    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchCourseCount();
      fetchAllCourses();
      fetchLearners();
      fetchUserMap();
      fetchLearnerProgress();
      fetchRevenue();
      updateCourseStats();
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // New: Update filteredLearners whenever learners or learnerProgress changes
  useEffect(() => {
    // Get all learner IDs who purchased this manager's courses
    const learnerIds = new Set();
    Object.keys(learnerProgress).forEach(userId => {
      if (learnerProgress[userId] && learnerProgress[userId].length > 0) {
        learnerIds.add(userId);
      }
    });
    // Filter learners to only those in learnerIds
    setFilteredLearners(learners.filter(l => learnerIds.has(l._id)));
  }, [learners, learnerProgress]);

  const totalStudents = courses.reduce((sum, course) => sum + course.enrolledStudents, 0)
  const activeCourses = courses.filter((course) => course.status === "Active").length
  const avgCompletionRate =
    courses.length > 0
      ? Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length)
      : 0

  const [view, setView] = useState('courses'); // 'courses' or 'learners'

  const [editCourseId, setEditCourseId] = useState(null);
  const [editCourse, setEditCourse] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    price: '',
    youtubeLink: ''
  });

  const handleEditClick = (course) => {
    setEditCourseId(course.id);
    setEditCourse({
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      price: course.price,
      youtubeLink: course.youtubeLink
    });
    setShowCreateForm(false);
  };

  const handleEditCourse = async () => {
    if (
      editCourse.title &&
      editCourse.description &&
      editCourse.category &&
      editCourse.duration &&
      editCourse.price &&
      editCourse.youtubeLink
    ) {
      try {
        const response = await axios.put(`http://localhost:5000/api/courses/${editCourseId}`, {
          ...editCourse,
          managerId
        });
        if (response.status === 200) {
          setCourses((prevCourses) =>
            prevCourses.map((course) =>
              course.id === editCourseId
                ? { ...course, ...editCourse }
                : course
            )
          );
          setEditCourseId(null);
          setEditCourse({
            title: '',
            description: '',
            category: '',
            duration: '',
            price: '',
            youtubeLink: ''
          });
          showSuccess('Course updated successfully!');
        } else {
          showError(response.data.message || 'Failed to update course.');
        }
      } catch (error) {
        showError('Error updating course: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditCourseId(null);
    setEditCourse({
      title: '',
      description: '',
      category: '',
      duration: '',
      price: '',
      youtubeLink: ''
    });
  };

  const [viewCourse, setViewCourse] = useState(null);

  const handleViewClick = (course) => {
    setViewCourse(course);
  };

  const handleCloseView = () => {
    setViewCourse(null);
  };

  // Get manager name from localStorage
  const [managerName, setManagerName] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.full_name) {
      setManagerName(user.full_name);
    } else if (user && user.email) {
      setManagerName(user.email);
    }
  }, []);

  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title">
              <div className="header-icon">
                <img src={logo} alt="Learn Genie Logo" className="header-icon" />
              </div>
              <h1>Course Manager Dashboard</h1>
            </div>
          </div>
          <div className="header-right">
            {managerName && (
              <span style={{ marginRight: '1rem', fontWeight: 500, color: '#764ba2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {managerName}
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  onClick={() => setShowProfile((prev) => !prev)}
                  title="View Profile"
                >
                  <UserCircle size={24} color="#764ba2" />
                </button>
              </span>
            )}
            <button onClick={handleSignOut} className="signout-button">
              <LogOut className="signout-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to sign out?</p>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    window.location.href = "/";
                  }}
                  className="submit-button"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showProfile ? (
          <div className="table-container" style={{marginBottom:'2rem'}}>
            <div className="table-wrapper">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
                <h2 className="section-title">Your Course Revenue</h2>
                <button onClick={() => setShowProfile(false)} className="cancel-button">Back to Dashboard</button>
              </div>
              <table className="courses-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Course Title</th>
                    <th className="table-header-cell">Purchases</th>
                    <th className="table-header-cell">Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {revenueData.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center' }}>No revenue data yet.</td></tr>
                  ) : revenueData.map((row, idx) => (
                    <tr key={row.title+idx} className="table-row">
                      <td className="table-cell">{row.title}</td>
                      <td className="table-cell">{row.count}</td>
                      <td className="table-cell">{row.revenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="welcome-section" style={{ marginBottom: '2rem', background: '#f0fdfa', borderRadius: '0.75rem', padding: '1.5rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#764ba2' }}>Welcome, {managerName ? managerName : 'Course Manager'}!</h2>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#374151' }}>Manage your courses and learners efficiently from this dashboard.</p>
            </div>
            {/* Tab Navigation Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
              <button
                onClick={() => setView('courses')}
                className={`nav-tab-button${view === 'courses' ? ' active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: view === 'courses' ? '3px solid #764ba2' : '3px solid transparent',
                  color: view === 'courses' ? '#764ba2' : '#6b7280',
                  fontWeight: view === 'courses' ? 'bold' : 'normal',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  outline: 'none',
                  transition: 'color 0.2s, border-bottom 0.2s',
                }}
              >
                <BookOpen size={20} />
                <span>Courses</span>
              </button>
              <button
                onClick={() => setView('learners')}
                className={`nav-tab-button${view === 'learners' ? ' active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: view === 'learners' ? '3px solid #764ba2' : '3px solid transparent',
                  color: view === 'learners' ? '#764ba2' : '#6b7280',
                  fontWeight: view === 'learners' ? 'bold' : 'normal',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  outline: 'none',
                  transition: 'color 0.2s, border-bottom 0.2s',
                }}
              >
                <Users size={20} />
                <span>Learners</span>
              </button>
            </div>
            {/* Stats Cards and Content */}
            {view === 'courses' && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-icon-container blue">
                        <BookOpen className="stat-icon" />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Total Courses</p>
                        <p className="stat-value">{courses.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-icon-container green">
                        <Users className="stat-icon" />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Total Students</p>
                        <p className="stat-value">{totalStudents}</p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-content">
                      <div className="stat-icon-container purple">
                        <BarChart3 className="stat-icon" />
                      </div>
                      <div className="stat-info">
                        <p className="stat-label">Avg. Completion</p>
                        <p className="stat-value">{avgCompletionRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Manual Refresh Button */}
                <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1rem'}}>
                  <button onClick={handleManualRefresh} className="create-button" style={{padding:'0.5rem 1.5rem',fontSize:'1rem'}}>
                    Refresh
                  </button>
                </div>
                {/* Action Bar */}
                <div className="action-bar">
                  <h2 className="section-title">Manage Courses</h2>
                  <button onClick={openCreateForm} className="create-button">
                    <Plus className="create-icon" />
                    <span>Create New Course</span>
                  </button>
                </div>
                {/* Create Course Form */}
                {showCreateForm && (
                  <div className="create-form-container">
                    <h3 className="form-title">Create New Course</h3>
                    {createError && (
                      <div style={{ color: 'red', marginBottom: '10px' }}>{createError}</div>
                    )}
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Course Title</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCourse.title}
                          onChange={(e) => {
                            setNewCourse({ ...newCourse, title: e.target.value });
                            setCreateErrors((prev) => ({ ...prev, title: "" }));
                          }}
                          placeholder="Enter course title"
                        />
                        {createErrors.title && <div style={{ color: 'red', marginBottom: '5px' }}>{createErrors.title}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCourse.category}
                          onChange={(e) => {
                            setNewCourse({ ...newCourse, category: e.target.value });
                            setCreateErrors((prev) => ({ ...prev, category: "" }));
                          }}
                          placeholder="Category"
                        />
                        {createErrors.category && <div style={{ color: 'red', marginBottom: '5px' }}>{createErrors.category}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Duration</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCourse.duration}
                          onChange={(e) => {
                            setNewCourse({ ...newCourse, duration: e.target.value });
                            setCreateErrors((prev) => ({ ...prev, duration: "" }));
                          }}
                          placeholder="Duration (e.g., 8 weeks)"
                        />
                        {createErrors.duration && <div style={{ color: 'red', marginBottom: '5px' }}>{createErrors.duration}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Amount (Price)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCourse.price}
                          onChange={(e) => {
                            setNewCourse({ ...newCourse, price: e.target.value });
                            setCreateErrors((prev) => ({ ...prev, price: "" }));
                          }}
                          placeholder="Amount (e.g., 499, Free)"
                        />
                        {createErrors.price && <div style={{ color: 'red', marginBottom: '5px' }}>{createErrors.price}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">YouTube Link (Private)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCourse.youtubeLink}
                          onChange={(e) => {
                            setNewCourse({ ...newCourse, youtubeLink: e.target.value });
                            setCreateErrors((prev) => ({ ...prev, youtubeLink: "" }));
                          }}
                          placeholder="Paste private YouTube link here"
                        />
                        {createErrors.youtubeLink && <div style={{ color: 'red', marginBottom: '5px' }}>{createErrors.youtubeLink}</div>}
                      </div>
                      <div className="form-group" style={{gridColumn: '1/-1'}}>
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-textarea"
                          value={newCourse.description}
                          onChange={(e) => {
                            setNewCourse({ ...newCourse, description: e.target.value });
                            setCreateErrors((prev) => ({ ...prev, description: "" }));
                          }}
                          placeholder="Enter course description"
                          rows="3"
                        />
                        {createErrors.description && <div style={{ color: 'red', marginBottom: '5px' }}>{createErrors.description}</div>}
                      </div>
                    </div>
                    <div className="form-actions">
                      <button onClick={handleCreateCourse} className="submit-button">
                        Create Course
                      </button>
                      <button onClick={() => { setShowCreateForm(false); setCreateError(""); }} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {/* Courses Table */}
                <div className="table-container">
                  <div className="table-wrapper">
                    <table className="courses-table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Course</th>
                          <th className="table-header-cell">Category</th>
                          <th className="table-header-cell">Students</th>
                          <th className="table-header-cell">Completion</th>
                          <th className="table-header-cell">Avg. Rating</th>
                          <th className="table-header-cell">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {courses.map((course) => [
                          <tr key={course.id} className="table-row">
                            <td className="table-cell course-info">
                              <div>
                                <div className="course-title">{course.title}</div>
                                <div className="course-description">
                                  Learn Genie{userMap[course.createdBy] ? ` (${userMap[course.createdBy]})` : ''}
                                </div>
                                <div className="course-description">{course.description}</div>
                                <div className="course-date">
                                  <Calendar className="date-icon" />
                                  Created: {course.createdDate}
                                </div>
                              </div>
                            </td>
                            <td className="table-cell">
                              <span className="category-badge">{course.category}</span>
                            </td>
                            <td className="table-cell">
                              <div className="students-info">
                                <Users className="students-icon" />
                                {course.enrolledStudents}
                              </div>
                            </td>
                            <td className="table-cell">
                              <div className="completion-info">
                                <div className="progress-bar">
                                  <div className="progress-fill" style={{ width: `${course.completionRate}%` }}></div>
                                </div>
                                <span className="completion-text">{course.completionRate}%</span>
                              </div>
                            </td>
                            <td className="table-cell">
                              <CourseAverageRating courseId={course.id} />
                            </td>
                            <td className="table-cell">
                              <div className="action-buttons">
                                <button className="action-button view" onClick={() => handleViewClick(course)}>
                                  <Eye className="action-icon" />
                                </button>
                                <button className="action-button edit" onClick={() => handleEditClick(course)} disabled={course.createdBy !== managerId}>
                                  <Edit className="action-icon" />
                                </button>
                                <button onClick={() => handleDeleteCourse(course.id)} disabled={course.createdBy !== managerId} className="action-button delete">
                                  <Trash2 className="action-icon" />
                                </button>
                              </div>
                            </td>
                          </tr>,
                          viewCourse && viewCourse.id === course.id && (
                            <tr key={course.id + '-view'} className="table-row">
                              <td className="table-cell" colSpan={5} style={{ background: '#f9fafb', border: '2px solid #764ba2' }}>
                                <div className="form-grid">
                                  <div className="form-group">
                                    <label className="form-label">Course Title</label>
                                    <div className="form-input" style={{ background: '#e5e7eb' }}>{viewCourse.title}</div>
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <div className="form-input" style={{ background: '#e5e7eb' }}>{viewCourse.category}</div>
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Duration</label>
                                    <div className="form-input" style={{ background: '#e5e7eb' }}>{viewCourse.duration}</div>
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Amount (Price)</label>
                                    <div className="form-input" style={{ background: '#e5e7eb' }}>{viewCourse.price}</div>
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">YouTube Link (Private)</label>
                                    <div className="form-input" style={{ background: '#e5e7eb', wordBreak: 'break-all' }}>{viewCourse.youtubeLink}</div>
                                  </div>
                                  <div className="form-group" style={{gridColumn: '1/-1'}}>
                                    <label className="form-label">Description</label>
                                    <div className="form-input" style={{ background: '#e5e7eb', minHeight: '60px' }}>
                                      Learn Genie{userMap[viewCourse.createdBy] ? ` (${userMap[viewCourse.createdBy]})` : ''}
                                      <br />
                                      {viewCourse.description}
                                    </div>
                                  </div>
                                  <div className="form-group" style={{gridColumn: '1/-1'}}>
                                    <label className="form-label">Created Date</label>
                                    <div className="form-input" style={{ background: '#e5e7eb' }}>{viewCourse.createdDate}</div>
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Enrolled Students</label>
                                    <div className="form-input" style={{ background: '#e5e7eb' }}>{viewCourse.enrolledStudents}</div>
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Completion Rate</label>
                                    <div className="form-input" style={{ background: '#e5e7eb' }}>{viewCourse.completionRate}%</div>
                                  </div>
                                </div>
                                {viewCourse && (
                                  <div style={{ marginTop: '2rem', background: '#f3f4f6', borderRadius: '8px', padding: '1rem' }}>
                                    <CourseRatingsManager courseId={viewCourse.id} />
                                  </div>
                                )}
                                <div className="form-actions">
                                  <button onClick={handleCloseView} className="cancel-button">
                                    Close
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ),
                          editCourseId === course.id && (
                            <tr key={course.id + '-edit'} className="table-row">
                              <td className="table-cell" colSpan={5} style={{ background: '#f9fafb', border: '2px solid #764ba2' }}>
                                <div className="form-grid">
                                  <div className="form-group">
                                    <label className="form-label">Course Title</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={editCourse.title}
                                      onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
                                      placeholder="Enter course title"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={editCourse.category}
                                      onChange={(e) => setEditCourse({ ...editCourse, category: e.target.value })}
                                      placeholder="Category"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Duration</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={editCourse.duration}
                                      onChange={(e) => setEditCourse({ ...editCourse, duration: e.target.value })}
                                      placeholder="Duration (e.g., 8 weeks)"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">Amount (Price)</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={editCourse.price}
                                      onChange={(e) => setEditCourse({ ...editCourse, price: e.target.value })}
                                      placeholder="Amount (e.g., 499, Free)"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label className="form-label">YouTube Link (Private)</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={editCourse.youtubeLink}
                                      onChange={(e) => setEditCourse({ ...editCourse, youtubeLink: e.target.value })}
                                      placeholder="Paste private YouTube link here"
                                    />
                                  </div>
                                  <div className="form-group" style={{gridColumn: '1/-1'}}>
                                    <label className="form-label">Description</label>
                                    <textarea
                                      className="form-textarea"
                                      value={editCourse.description}
                                      onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                                      placeholder="Enter course description"
                                      rows="3"
                                    />
                                  </div>
                                </div>
                                <div className="form-actions">
                                  <button onClick={handleEditCourse} className="submit-button">
                                    Save Changes
                                  </button>
                                  <button onClick={handleCancelEdit} className="cancel-button">
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        ])}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            {view === 'learners' && (
              <div className="table-container">
                <div className="table-wrapper">
                  <h2 className="section-title" style={{ padding: '1rem' }}>All Learners</h2>
                  {loadingLearners ? (
                    <div style={{ padding: '1rem' }}>Loading learners...</div>
                  ) : (
                    <table className="courses-table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Name</th>
                          <th className="table-header-cell">Email</th>
                          <th className="table-header-cell">Role</th>
                          <th className="table-header-cell">Progress (Your Courses)</th>
                          <th className="table-header-cell">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {filteredLearners.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center' }}>No learners found.</td></tr>
                        ) : filteredLearners.map(learner => (
                          <tr key={learner._id} className="table-row">
                            <td className="table-cell">{learner.full_name}</td>
                            <td className="table-cell">{learner.email}</td>
                            <td className="table-cell">{learner.role}</td>
                            <td className="table-cell">
                              {/* Show progress for each course this learner is enrolled in (for this manager's courses) */}
                              {learnerProgress[learner._id] && learnerProgress[learner._id].length > 0 ? (
                                <ul style={{margin:0,paddingLeft:'1em'}}>
                                  {learnerProgress[learner._id].map((p, idx) => {
                                    const course = courses.find(c => c.id === p.courseId);
                                    return (
                                      <li key={p.courseId+idx}>
                                        {course ? course.title : p.courseId}: {p.progress}%
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <span style={{color:'#9ca3af'}}>No enrollments</span>
                              )}
                            </td>
                            <td className="table-cell">
                              <button onClick={() => handleDeleteLearner(learner._id)} className="action-button delete">
                                <Trash2 className="action-icon" /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CourseRatingsManager({ courseId }) {
  const [ratings, setRatings] = useState([]);
  useEffect(() => {
    if (!courseId) return;
    axios.get(`http://localhost:5000/api/courses/${courseId}/all-ratings`)
      .then(res => setRatings(res.data.ratings || []));
  }, [courseId]);
  return (
    <div>
      <h3>All Ratings for this Course</h3>
      {ratings.length === 0 ? (
        <div style={{ color: '#888' }}>No ratings yet.</div>
      ) : (
        <ul style={{ paddingLeft: '1em' }}>
          {ratings.map((r, idx) => (
            <li key={idx} style={{ marginBottom: '0.5em' }}>
              <b>{r.userId?.full_name || 'Unknown'}</b> ({r.userId?.email || 'N/A'}): <span style={{ color: '#f59e0b' }}>{r.rating} stars</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CourseAverageRating({ courseId }) {
  const [avg, setAvg] = useState(null);
  const [count, setCount] = useState(null);
  useEffect(() => {
    if (!courseId) return;
    fetch(`http://localhost:5000/api/courses/${courseId}/ratings`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(r => {
        setAvg(r.average || 0);
        setCount(r.count || 0);
      });
  }, [courseId]);
  return (
    <span style={{ color: '#f59e0b', fontWeight: 600 }}>
      {avg !== null ? avg.toFixed(1) : '-'}
      <span style={{ color: '#888', fontWeight: 400, fontSize: '0.9em' }}>
        {count !== null ? ` (${count})` : ''}
      </span>
    </span>
  );
}
